import datetime

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from client.models import Client
from common.models import Skill
from helpers.exceptions import InvalidRequest
from project.constants import RequestKeys, PermissionKeys, ErrorMessages, ResponseKeys
from project.filters import ProjectFilter
from project.models import Project, ProjectPOC, ProjectPosition, ProjectPositionSkills, ProjectRole, \
    ProjectPositionHistory, ProjectAllocation, ProjectAllocationRequest, ProjectAllocationHistory, Notification
from user.constants import StatusKeys
from user.models import Role, User
from user.services import update_user_status
from utils.slack_message import send_slack_message


class ProjectService:

    @transaction.atomic
    def create_project(self, data, request_user):
        """
        Method to create a project.
        """
        status = data.get(RequestKeys.STATUS)
        client = data.get(RequestKeys.CLIENT)
        account_manager = data.pop('account_manager', client.account_manager)

        if status in Project.PRIVILEGED_STATUSES and not request_user.has_perm(
                PermissionKeys.PRIVILEGED_STATUS_PERMISSION):
            raise PermissionDenied(
                ErrorMessages.PRIVILEGED_STATUS_PERMISSION_DENIED.format(status=status.lower()))

        pocs = data.pop(RequestKeys.POCS, [])
        project = Project.objects.create(
            **data, created_by=request_user, account_manager=account_manager)
        if pocs:
            pocs = [ProjectPOC(**poc, project=project) for poc in pocs]
            ProjectPOC.objects.bulk_create(pocs)

        account_manager_name = project.account_manager.full_name if project.account_manager \
            else ErrorMessages.NO_AM_ASSIGNED
        message = f"Project: *{project.name}* was created successfully on _{datetime.date.today()}_ \
                    \nClient: *{project.client.name}* \nAM: *{account_manager_name}*"
        send_slack_message(message)
        return project

    @transaction.atomic
    def edit_project_details(self, project_id, data, request_user):
        """
        Method to edit a project.
        """
        project = Project.objects.filter(id=project_id)
        if not project:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ID)

        status = data.get(RequestKeys.STATUS)
        if status in Project.PRIVILEGED_STATUSES and not request_user.has_perm(
                PermissionKeys.PRIVILEGED_STATUS_PERMISSION):
            raise PermissionDenied(
                ErrorMessages.PRIVILEGED_STATUS_PERMISSION_DENIED.format(status=status.lower()))

        project_positions = ProjectPosition.objects.filter(Q(project_role_id__project__id=project_id),
                                                           Q(end_date__gt=datetime.date.today()))
        if status == Project.Status.CLOSED and project_positions.exists():
            raise InvalidRequest(
                ErrorMessages.ALL_POSITIONS_RELATED_TO_PROJECT_IS_NOT_CLOSED)

        elif status == Project.Status.CLOSED:
            account_manager_name = project.first().account_manager.full_name if project.first().account_manager \
                else ErrorMessages.NO_AM_ASSIGNED
            send_slack_message(f"Project: *{project.first().name}* was closed on _{datetime.date.today()}_ \
                               \nClient: *{project.first().client.name}* \nAM: *{account_manager_name}*")

        pocs = data.pop(RequestKeys.POCS, [])
        project.update(**data, modified_time=timezone.now())
        project = project.first()
        project.pocs.all().delete()
        if pocs:
            pocs = [ProjectPOC(**poc, project=project) for poc in pocs]
            ProjectPOC.objects.bulk_create(pocs)

        return project

    def patch_project(self, project_id, data):
        """
        Method to patch a project.
        """
        project = Project.objects.filter(id=project_id).first()

        if not project:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ID)

        status = data.get(RequestKeys.STATUS)
        project_positions = ProjectPosition.objects.filter(Q(project_role_id__project__id=project_id),
                                                           Q(end_date__gt=datetime.date.today()))
        if status == Project.Status.CLOSED and project_positions.exists():
            raise InvalidRequest(
                ErrorMessages.ALL_POSITIONS_RELATED_TO_PROJECT_IS_NOT_CLOSED)

        elif status == Project.Status.CLOSED:
            account_manager_name = project.account_manager.full_name if project.account_manager \
                else ErrorMessages.NO_AM_ASSIGNED
            send_slack_message(f"Project: *{project.name}* was closed on _{datetime.date.today()}_\
                               \nClient: *{project.client.name}* \nAM: *{account_manager_name}*")

        project.status = status
        project.save()
        return project

    def list_projects(self, filters):
        """
        Method to list projects.
        """
        projects = Project.objects.all().select_related('client')
        projects = ProjectFilter(filters, projects).qs
        projects = projects.order_by('-start_date')
        return projects

    def get_project_creation_dropdowns(self, request_user):
        """
        Method to return dropdowns required while adding/editing projects.
        """
        if request_user.has_perm(PermissionKeys.PRIVILEGED_STATUS_PERMISSION):
            status = [{'id': identifier, 'name': name}
                      for identifier, name in Project.Status.choices]
        else:
            status = [{'id': identifier, 'name': name} for identifier, name in Project.Status.choices
                      if identifier not in Project.PRIVILEGED_STATUSES]
        engagements = [{'id': identifier, 'name': name}
                       for identifier, name in Project.Engagement.choices]
        delivery_modes = [{'id': identifier, 'name': name}
                          for identifier, name in Project.DeliveryMode.choices]
        clients = Client.objects.filter(
            status=Client.Status.ACTIVE).order_by('name')
        account_managers = User.objects.filter_by_permission(PermissionKeys.ACCOUNT_MANAGER_PERMISSION).filter(
            status=StatusKeys.ACTIVE) \
            .order_by('first_name', 'last_name')

        return {
            ResponseKeys.STATUS: status,
            ResponseKeys.ENGAGEMENTS: engagements,
            ResponseKeys.DELIVERY_MODES: delivery_modes,
            ResponseKeys.CLIENTS: clients,
            ResponseKeys.ACCOUNT_MANAGERS: account_managers
        }

    def retrieve_project(self, project_id):
        """
        Method to retrieve project details by ID.
        """
        project = Project.objects.filter(
            id=project_id).select_related('client').first()
        if not project:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ID)
        return project


class ProjectAllocationService:
    def get_project_position_dropdowns(self, data):
        """
        Method to return dropdowns required while adding/editing project positions.
        """
        roles = Role.objects.all().order_by('name')
        skills = Skill.objects.all().order_by('name')

        search = data.get(RequestKeys.SEARCH)
        if search:
            roles = roles.filter(name__icontains=search)
            skills = skills.filter(name__icontains=search)

        return {
            ResponseKeys.ROLES: roles,
            ResponseKeys.SKILLS: skills
        }

    @transaction.atomic
    def create_project_position(self, data, request_user):
        """
        Method to create project positions.
        """
        project = data.pop(RequestKeys.PROJECT)
        project_start_date = project.start_date
        project_end_date = project.end_date
        role = data.pop(RequestKeys.ROLE)
        project_role, _ = ProjectRole.objects.get_or_create(
            project=project, role=role)
        positions = data.get(RequestKeys.POSITIONS, [])
        positions_list = []

        for index, position_data in enumerate(positions):
            skills = position_data.pop(RequestKeys.SKILLS, None)
            position_end_date = position_data.pop(RequestKeys.END_DATE, None)
            position_start_date = position_data.pop(RequestKeys.START_DATE)
            if position_start_date < project_start_date:
                raise InvalidRequest({
                    ResponseKeys.ROW: index + 1,
                    ResponseKeys.MESSAGE: ErrorMessages.POSITION_START_DATE_IS_BEFORE_PROJECT_START_DATE,
                    ResponseKeys.CODE: InvalidRequest.default_code})         
            if position_end_date is None:
                if project_end_date is None:
                    position_end_date = project_start_date + \
                        datetime.timedelta(days=180)
                else :
                    position_end_date=project_end_date
            if  (project_end_date and position_end_date) and position_end_date > project_end_date:
                raise InvalidRequest({
                    ResponseKeys.ROW: index + 1,
                    ResponseKeys.MESSAGE: ErrorMessages.POSITION_DATE_IS_BEYOND_PROJECT_END_DATE,
                    ResponseKeys.CODE: InvalidRequest.default_code})

            position = ProjectPosition.objects.create(project_role=project_role, **position_data,
                                                      start_date=position_start_date,
                                                      end_date=position_end_date)
            positions_list.append(position)
            if skills:
                position_skills = [ProjectPositionSkills(skill=skill, position=position, priority=priority + 1)
                                   for priority, skill in enumerate(skills)]
            ProjectPositionSkills.objects.bulk_create(position_skills)

            # record history
            ProjectPositionHistory.objects.create(
                position=position,
                start_date=position.start_date, end_date=position.end_date, utilization=position.utilization,
                added_by=request_user, created_time=position.created_time, modified_time=position.modified_time,
                is_billable=position.is_billable
            )

        return positions_list

    @transaction.atomic
    def edit_project_position(self, position_id, data, request_user):
        """
        Method to edit project position.
        """
        position = ProjectPosition.objects.select_related(
            'project_role__project').filter(id=position_id).first()
        if not position:
            raise InvalidRequest(ErrorMessages.INVALID_POSITION_ID)
        project = position.project_role.project
        skills = data.pop(RequestKeys.SKILLS, None)

        end_date = data[RequestKeys.END_DATE]
        start_date = data[RequestKeys.START_DATE]

        if end_date is None:
            end_date = start_date + datetime.timedelta(days=180)
            if project.end_date and end_date > project.end_date:
                end_date = project.end_date
        else:
            project_allocation = ProjectAllocation.objects.filter(
                position_id=position.id, end_date__gt=end_date)
            if project_allocation.exists():
                raise InvalidRequest(
                    ErrorMessages.POSITION_DATE_IS_BEYOND_ALLOCATION_DATE_RANGE)
            if (project.end_date and end_date > project.end_date):
                raise InvalidRequest(
                    ErrorMessages.POSITION_DATE_IS_BEYOND_PROJECT_END_DATE)

        position.is_billable = data[RequestKeys.IS_BILLABLE]
        position.utilization = data[RequestKeys.UTILIZATION]
        position.start_date = data[RequestKeys.START_DATE]
        position.end_date = end_date
        position.save()
        ProjectPositionSkills.objects.filter(position_id=position_id).delete()
        if skills:
            position_skills = [ProjectPositionSkills(skill=skill, position=position, priority=priority + 1)
                               for priority, skill in enumerate(skills)]
            ProjectPositionSkills.objects.bulk_create(position_skills)

        ProjectPositionHistory.objects.create(
            position=position,
            start_date=position.start_date, end_date=position.end_date, utilization=position.utilization,
            added_by=request_user, created_time=position.created_time, modified_time=position.modified_time,
            is_billable=position.is_billable
        )

        return position

    def delete_project_position(self, position_id):
        project_position = ProjectPosition.objects.filter(id=position_id)
        if not project_position:
            raise InvalidRequest(ErrorMessages.INVALID_POSITION_ID)
        allocation_on_position = ProjectAllocation.objects.filter(
            position=position_id)
        if not allocation_on_position:
            project_position.delete()
        else:
            raise InvalidRequest(
                ErrorMessages.USERS_ALLOCATED_TO_THIS_POSITION)

    def delete_project_role(self, project_role_id):
        project_role = ProjectRole.objects.filter(id=project_role_id)
        if not project_role:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ROLE_ID)
        project_allocations = ProjectAllocation.objects.filter(
            position__project_role__in=project_role)

        for allocation in project_allocations:
            user = allocation.user
            utilization = allocation.utilization
            update_user_status(user, utilization)

        project_role.delete()

    def create_project_allocation_validation(self, data):
        position = data.get(RequestKeys.POSITION)
        start_date = data.get(RequestKeys.START_DATE)
        end_date = data.get(RequestKeys.END_DATE)
        utilization = data.get(RequestKeys.UTILIZATION)
        role = position.project_role.role
        project = position.project_role.project
        user = data.get(RequestKeys.USER)

        if user.last_working_day and user.last_working_day < end_date:
            raise InvalidRequest(
                ErrorMessages.USER_WILL_NOT_BE_AVAILABLE_TILL_GIVEN_DATE)

        if not end_date:
            end_date = position.end_date

        if start_date > end_date:
            raise InvalidRequest(
                ErrorMessages.START_DATE_GREATER_THAN_END_DATE)

        data[RequestKeys.TENTATIVE] = project.status in [
            Project.Status.COLD, Project.Status.HOT, Project.Status.WARM]

        if (utilization and position.utilization) and utilization > position.utilization:
            raise InvalidRequest(
                ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)

        if project.status == Project.Status.CLOSED:
            raise InvalidRequest(ErrorMessages.PROJECT_IS_CLOSED)

        project_allocation = ProjectAllocation.objects.filter(Q(position_id=position.id), ~Q(user_id=user.id), ~(
            Q(end_date__lt=start_date) | Q(start_date__gt=end_date)))

        if project_allocation.exists():
            raise InvalidRequest(
                ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)

        positions_for_role = ProjectPosition.objects.filter(
            project_role__project=project, project_role__role=role)
        project_allocation_for_role = ProjectAllocation.objects.filter(
            position__in=positions_for_role, user_id=user.id, end_date__gte=start_date)

        if project_allocation_for_role.exists():
            raise InvalidRequest(
                ErrorMessages.TALENT_IS_ALREADY_ALLOCATED_TO_ROLE)

        if position.end_date:
            if not (position.start_date <= start_date <= position.end_date and
                    position.start_date <= end_date <= position.end_date) and position.end_date:
                raise InvalidRequest(
                    ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)
        data[RequestKeys.END_DATE] = end_date

        return data

    @transaction.atomic
    def create_project_allocation(self, data, request_user):
        position = data.get(RequestKeys.POSITION)
        project = position.project_role.project
        data = self.create_project_allocation_validation(data)
        user = data.get(RequestKeys.USER)

        allocation = ProjectAllocation.objects.create(**data)

        update_user_status(user)

        # record history
        ProjectAllocationHistory.objects.create(
            allocation=allocation, user=allocation.user, position=allocation.position,
            kt_period=allocation.kt_period, tentative=allocation.tentative,
            start_date=allocation.start_date, end_date=allocation.end_date, utilization=allocation.utilization,
            added_by=request_user, created_time=allocation.created_time, modified_time=allocation.modified_time
        )
        account_manager = project.account_manager
        if account_manager:
            other_data = {
                "project_id": project.id,
                "requests_user": allocation.user.full_name,
            }
            Notification.objects.create(notification_type=Notification.NotificationType.NEW_ALLOCATION,
                                        sender=request_user,
                                        receiver=account_manager,
                                        object_id=allocation.id,
                                        content_type=ContentType.objects.get_for_model(
                                            allocation),
                                        object=allocation,
                                        json_data=other_data)

    def handle_update_new_allocation(self, position, allocation, utilization, end_date):
        if (utilization and position.utilization) and utilization > position.utilization:
            raise InvalidRequest(
                ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)
        if not (position.start_date <= datetime.date.today() <= position.end_date and position.start_date
                <= end_date <= position.end_date):
            raise InvalidRequest(
                ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)
        if allocation.start_date == datetime.date.today():
            allocation.end_date = datetime.date.today()
        else:
            allocation.end_date = datetime.date.today() - datetime.timedelta(days=1)
        allocation.save()
        return allocation

    def post_allocation_update(self, project, allocation, utilization, end_date, request_user):
        previous_utilization = allocation.utilization
        requests_utilization = utilization
        previous_end_date = allocation.end_date.strftime('%Y-%m-%d')
        requests_end_date = end_date.strftime('%Y-%m-%d')
        if previous_end_date == requests_end_date:
            previous_end_date = None
            requests_end_date = None
        if previous_utilization == requests_utilization:
            previous_utilization = None
            requests_utilization = None
        account_manager = project.account_manager
        if account_manager:
            other_data = {
                "project_id": project.id,
                "requests_user": allocation.user.full_name,
                "previous_utilization": previous_utilization,
                "requests_utilization": requests_utilization,
                "previous_end_date": previous_end_date,
                "requests_end_date": requests_end_date,
            }
            Notification.objects.create(notification_type=Notification.NotificationType.ALLOCATION_CHANGE,
                                        sender=request_user,
                                        receiver=account_manager,
                                        object_id=allocation.id,
                                        content_type=ContentType.objects.get_for_model(
                                            allocation),
                                        object=allocation,
                                        json_data=other_data)
        ProjectAllocationHistory.objects.create(
            allocation=allocation, user=allocation.user, position=allocation.position,
            kt_period=allocation.kt_period, tentative=allocation.tentative,
            start_date=allocation.start_date, end_date=allocation.end_date, utilization=allocation.utilization,
            added_by=request_user, created_time=allocation.created_time, modified_time=allocation.modified_time
        )

    @transaction.atomic
    def edit_project_allocation(self, allocation_id, data, request_user):
        allocation = ProjectAllocation.objects.filter(id=allocation_id).first()
        if not allocation:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)
        position = allocation.position
        end_date = data.get(RequestKeys.END_DATE)
        utilization = data.get(RequestKeys.UTILIZATION)
        project = position.project_role.project
        user = data.get(RequestKeys.USER)

        if user.last_working_day and user.last_working_day < end_date:
            raise InvalidRequest(
                ErrorMessages.USER_WILL_NOT_BE_AVAILABLE_TILL_GIVEN_DATE)

        data[RequestKeys.TENTATIVE] = project.status in [
            Project.Status.COLD, Project.Status.HOT, Project.Status.WARM]

        project_allocation = ProjectAllocation.objects.filter(Q(position_id=position.id), ~Q(user=user), ~(
            Q(end_date__lt=datetime.date.today()) | Q(start_date__gt=end_date)))

        if project_allocation.exists():
            raise InvalidRequest(
                ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)

        if utilization != allocation.utilization:
            allocation = self.handle_update_new_allocation(
                position, allocation, utilization, end_date)
            new_allocation = ProjectAllocation.objects.create(**data, start_date=datetime.date.today(),
                                                              position=allocation.position,
                                                              kt_period=0)
            self.post_allocation_update(
                project, new_allocation, utilization, end_date, request_user)

        else:
            if end_date > position.end_date:
                raise InvalidRequest(
                    ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)
            allocation.end_date = end_date
            allocation.save()
            self.post_allocation_update(
                project, allocation, utilization, end_date, request_user)

        update_user_status(user)

    def delete_project_allocation(self, allocation_id, request_user):
        project_allocation = ProjectAllocation.objects.filter(
            id=allocation_id).first()
        if not project_allocation:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)
        project = project_allocation.position.project_role.project
        account_manager = project.account_manager
        if account_manager:
            other_data = {
                "project_id": project.id,
                "requests_user": project_allocation.user.full_name,
            }
            Notification.objects.create(notification_type=Notification.NotificationType.DELETE_ALLOCATION,
                                        sender=request_user,
                                        receiver=account_manager,
                                        json_data=other_data)

        user = project_allocation.user
        utilization = project_allocation.utilization
        update_user_status(user, utilization)
        project_allocation.delete()

    @transaction.atomic
    def create_project_allocation_request(self, data, request_user):
        position = data.get(RequestKeys.POSITION)
        project = position.project_role.project
        data = self.create_project_allocation_validation(data)
        allocation_request = ProjectAllocationRequest.objects.create(
            **data, requested_by=request_user)
        admins = User.objects.filter_by_permission(PermissionKeys.ADMIN_NOTIFICATION_PERMISSION) \
            .order_by('first_name', 'last_name')
        other_data = {
            "project_id": project.id,
            "requests_user": allocation_request.user.full_name,
        }
        notifications = [Notification(notification_type=Notification.NotificationType.NEW_ALLOCATION_REQUEST,
                                      sender=request_user,
                                      receiver=admin,
                                      object_id=allocation_request.id,
                                      content_type=ContentType.objects.get_for_model(
                                          allocation_request),
                                      object=allocation_request,
                                      json_data=other_data) for admin in admins]
        Notification.objects.bulk_create(notifications)

    def delete_project_allocation_request(self, allocation_request_id):
        project_allocation_request = ProjectAllocationRequest.objects.filter(
            id=allocation_request_id)
        if not project_allocation_request:
            raise InvalidRequest(
                ErrorMessages.INVALID_PROJECT_ALLOCATION_REQUEST_ID)
        project_allocation_request.delete()
        Notification.objects.filter(object_id=allocation_request_id).delete()

    def edit_project_allocation_request(self, allocation_id, data, request_user):
        allocation = ProjectAllocation.objects.filter(id=allocation_id).first()
        if not allocation:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ALLOCATION_ID)
        project = allocation.position.project_role.project
        position = allocation.position
        end_date = data.get(RequestKeys.END_DATE)
        utilization = data.get(RequestKeys.UTILIZATION)
        user = allocation.user

        if user.last_working_day and user.last_working_day < end_date:
            raise InvalidRequest(
                ErrorMessages.USER_WILL_NOT_BE_AVAILABLE_TILL_GIVEN_DATE)

        if (utilization and position.utilization) and utilization > position.utilization:
            raise InvalidRequest(
                ErrorMessages.REQUESTED_UTILIZATION_GREATER_THAN_POSITION_UTILIZATION)
        kt_period = 0
        if allocation:
            kt_period = 0
        if not allocation:
            kt_period = allocation.kt_period

        if not (position.start_date <= datetime.date.today() <= position.end_date and position.start_date
                <= end_date <= position.end_date):
            raise InvalidRequest(
                ErrorMessages.ALLOCATION_IS_BEYOND_POSITION_DATE_RANGE)

        allocation_request = ProjectAllocationRequest.objects.create(**data, start_date=datetime.date.today(),
                                                                     allocation=allocation,
                                                                     user=allocation.user, position=allocation.position,
                                                                     kt_period=kt_period,
                                                                     requested_by=request_user)

        previous_utilization = allocation.utilization
        requests_utilization = utilization
        previous_end_date = allocation.end_date.strftime('%Y-%m-%d')
        requests_end_date = end_date.strftime('%Y-%m-%d')
        if previous_end_date == requests_end_date:
            previous_end_date = None,
            requests_end_date = None
        if previous_utilization == requests_utilization:
            previous_utilization = None
            requests_utilization = None

        admins = User.objects.filter_by_permission(PermissionKeys.ADMIN_NOTIFICATION_PERMISSION) \
            .order_by('first_name', 'last_name')
        other_data = {
            "project_id": project.id,
            "requests_user": allocation_request.user.full_name,
            "previous_utilization": previous_utilization,
            "requests_utilization": requests_utilization,
            "previous_end_date": previous_end_date,
            "requests_end_date": requests_end_date,
        }
        notifications = [Notification(notification_type=Notification.NotificationType.ALLOCATION_CHANGE_REQUEST,
                                      sender=request_user,
                                      receiver=admin,
                                      object_id=allocation_request.id,
                                      content_type=ContentType.objects.get_for_model(
                                          allocation_request),
                                      object=allocation_request,
                                      json_data=other_data) for admin in admins]
        Notification.objects.bulk_create(notifications)

    def handle_user_last_date_allocation(self, allocation_request):
        user = allocation_request.user
        if user.last_working_day and user.last_working_day < allocation_request.end_date:
            raise InvalidRequest(
                ErrorMessages.USER_WILL_NOT_BE_AVAILABLE_TILL_GIVEN_DATE)

    def handle_other_user_exists(self, project_allocation):
        if project_allocation.exists():
            raise InvalidRequest(
                ErrorMessages.OTHER_TALENT_IS_ALREADY_ALLOCATED_IN_GIVEN_DATE_RANGE)

    def update_allocation_for_new_utilization(self, allocation_request):
        if allocation_request.allocation.start_date == datetime.date.today():
            allocation_request.allocation.end_date = datetime.date.today()
        else:
            allocation_request.allocation.end_date = datetime.date.today() - \
                datetime.timedelta(days=1)
        allocation_request.allocation.save()

    def patch_approved_allocation_request(self, allocation_request, request_user):
        if allocation_request.allocation:
            # exclude given user is there any other allocate for that position
            project_allocation = ProjectAllocation.objects.filter(Q(position_id=allocation_request.position_id),
                                                                  ~Q(user_id=allocation_request.user_id), ~(
                Q(end_date__lt=datetime.date.today()) | Q(start_date__gt=allocation_request.end_date)))

            self.handle_other_user_exists(project_allocation)

            if allocation_request.allocation.utilization != allocation_request.utilization:
                # if allocation and manage talent utilization doing on same day then previous allocation start
                # date can't be > end date
                self.update_allocation_for_new_utilization(allocation_request)

                self.handle_user_last_date_allocation(allocation_request)

                allocation = ProjectAllocation.objects.create(user=allocation_request.user,
                                                              position=allocation_request.position,
                                                              utilization=allocation_request.utilization,
                                                              start_date=datetime.date.today(),
                                                              end_date=allocation_request.end_date,
                                                              kt_period=0,
                                                              tentative=allocation_request.tentative)
                update_user_status(allocation.user)
                ProjectAllocationHistory.objects.create(allocation=allocation, user=allocation.user,
                                                        position=allocation.position,
                                                        kt_period=allocation.kt_period,
                                                        tentative=allocation.tentative,
                                                        start_date=allocation.start_date,
                                                        end_date=allocation.end_date,
                                                        utilization=allocation.utilization,
                                                        added_by=request_user, created_time=allocation.created_time,
                                                        modified_time=allocation.modified_time)
                request_notification = Notification.objects.filter(
                    object_id=allocation_request.id).first()

                if not request_notification:
                    return InvalidRequest(ErrorMessages.INVALID_NOTIFICATION_REQUEST)

                other_data = {
                    "previous_utilization": request_notification.json_data['previous_utilization'],
                    "requests_utilization": request_notification.json_data['requests_utilization'],
                    "previous_end_date": request_notification.json_data['previous_end_date'],
                    "requests_end_date": request_notification.json_data['requests_end_date'],
                    "project_id": request_notification.json_data['project_id'],
                    "requests_user": allocation_request.user.full_name
                }
                Notification.objects.create(
                    notification_type=Notification.NotificationType.APPROVED_ALLOCATION_CHANGE_REQUEST,
                    sender=request_user,
                    receiver=request_notification.sender,
                    object_id=allocation.id,
                    content_type=ContentType.objects.get_for_model(
                        allocation),
                    object=allocation,
                    json_data=other_data)
            else:
                allocation_request.allocation.end_date = allocation_request.end_date
                allocation_request.allocation.save()
                update_user_status(allocation_request.user)
                request_notification = Notification.objects.filter(
                    object_id=allocation_request.id).first()

                if not request_notification:
                    return InvalidRequest(ErrorMessages.INVALID_NOTIFICATION_REQUEST)

                other_data = {
                    "previous_end_date": request_notification.json_data['previous_end_date'],
                    "requests_end_date": request_notification.json_data['requests_end_date'],
                    "project_id": request_notification.json_data['project_id'],
                    "requests_user": allocation_request.user.full_name,
                }
                Notification.objects.create(
                    notification_type=Notification.NotificationType.APPROVED_ALLOCATION_CHANGE_REQUEST,
                    sender=request_user,
                    receiver=request_notification.sender,
                    object_id=allocation_request.id,
                    content_type=ContentType.objects.get_for_model(
                        allocation_request),
                    object=allocation_request,
                    json_data=other_data)
        else:
            # for any user new project allocation
            project_allocation = ProjectAllocation.objects.filter(Q(position_id=allocation_request.position.id), ~(
                Q(end_date__lt=allocation_request.start_date) | Q(start_date__gt=allocation_request.end_date)))

            self.handle_user_last_date_allocation(allocation_request)

            self.handle_other_user_exists(project_allocation)

            allocation = ProjectAllocation.objects.create(user=allocation_request.user,
                                                          position=allocation_request.position,
                                                          utilization=allocation_request.utilization,
                                                          start_date=allocation_request.start_date,
                                                          end_date=allocation_request.end_date,
                                                          kt_period=allocation_request.kt_period,
                                                          tentative=allocation_request.tentative)

            update_user_status(allocation.user)
            ProjectAllocationHistory.objects.create(allocation=allocation, user=allocation.user,
                                                    position=allocation.position,
                                                    kt_period=allocation.kt_period, tentative=allocation.tentative,
                                                    start_date=allocation.start_date, end_date=allocation.end_date,
                                                    utilization=allocation.utilization,
                                                    added_by=request_user, created_time=allocation.created_time,
                                                    modified_time=allocation.modified_time)

            request_notification = Notification.objects.filter(
                object_id=allocation_request.id).first()

            if not request_notification:
                return InvalidRequest(ErrorMessages.INVALID_NOTIFICATION_REQUEST)

            other_data = {
                "project_id": request_notification.json_data['project_id'],
                "requests_user": allocation_request.user.full_name,
            }
            Notification.objects.create(notification_type=Notification.NotificationType.APPROVED_ALLOCATION_REQUEST,
                                        sender=request_user,
                                        receiver=request_notification.sender,
                                        object_id=allocation_request.id,
                                        content_type=ContentType.objects.get_for_model(
                                            allocation_request),
                                        object=allocation_request,
                                        json_data=other_data)

    def patch_denied_allocation_request(self, allocation_request, request_user):
        request_notification = Notification.objects.filter(
            object_id=allocation_request.id).first()

        if not request_notification:
            return InvalidRequest(ErrorMessages.INVALID_NOTIFICATION_REQUEST)

        if allocation_request.allocation:
            other_data = {
                "previous_utilization": request_notification.json_data['previous_utilization'],
                "requests_utilization": request_notification.json_data['requests_utilization'],
                "previous_end_date": request_notification.json_data['previous_end_date'],
                "requests_end_date": request_notification.json_data['requests_end_date'],
                "project_id": request_notification.json_data['project_id'],
                "requests_user": allocation_request.user.full_name,
            }
            notification_type = Notification.NotificationType.CANCEL_ALLOCATION_CHANGE_REQUEST

        else:
            other_data = {
                "project_id": request_notification.json_data['project_id'],
                "requests_user": request_notification.json_data['requests_user'],
            }
            notification_type = Notification.NotificationType.CANCEL_ALLOCATION_REQUEST

        Notification.objects.create(
            notification_type=notification_type,
            sender=request_user,
            receiver=request_notification.sender,
            object_id=allocation_request.id,
            content_type=ContentType.objects.get_for_model(
                allocation_request),
            object=allocation_request,
            json_data=other_data)

    @transaction.atomic
    def patch_project_allocation_request(self, allocation_request_id, data, request_user):
        allocation_request = ProjectAllocationRequest.objects.select_related(RequestKeys.ALLOCATION).filter(
            id=allocation_request_id).first()
        status = data.get(RequestKeys.STATUS)

        if not allocation_request:
            raise InvalidRequest(
                ErrorMessages.INVALID_PROJECT_ALLOCATION_REQUEST_ID)

        # for edit request
        allocation_request.status = status
        allocation_request.handler = request_user
        allocation_request.save()
        if status == ProjectAllocationRequest.Status.APPROVED:
            self.patch_approved_allocation_request(
                allocation_request, request_user)

        if status == ProjectAllocationRequest.Status.DENIED:
            self.patch_denied_allocation_request(
                allocation_request, request_user)


class ProjectTimelineService:
    def retrieve_project_timeline(self, project_id):
        project = Project.objects.filter(id=project_id).first()
        if not project:
            raise InvalidRequest(ErrorMessages.INVALID_PROJECT_ID)
        return project


class NotificationService:
    def get_notification(self, request_user):
        notification = []
        account_manager = User.objects.filter_by_permission(PermissionKeys.ACCOUNT_MANAGER_PERMISSION) \
            .order_by('first_name', 'last_name')
        admins = User.objects.filter_by_permission(PermissionKeys.ADMIN_NOTIFICATION_PERMISSION) \
            .order_by('first_name', 'last_name')
        if request_user in account_manager or request_user in admins:
            notification = Notification.objects.filter(
                Q(sender=request_user) | Q(receiver=request_user)).order_by('-created_time')
        return notification

    def read_notification(self, notification_id):
        """
        Method to patch a notification.
        """
        notification = Notification.objects.filter(id=notification_id).first()

        if not notification:
            raise InvalidRequest(ErrorMessages.INVALID_NOTIFICATION_ID)

        notification.unseen = False
        notification.save()
        return notification

    def read_all_notifications(self, request_user):
        Notification.objects.filter(
            receiver=request_user, unseen=True).update(unseen=False)
