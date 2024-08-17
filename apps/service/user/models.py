from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from utils.utils import months_difference
import re
from django.utils.functional import cached_property
from user.managers import UserManager
from common.models import Industry, Skill


class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)


class User(AbstractBaseUser, PermissionsMixin):
    employee_id = models.CharField(unique=True, max_length=30)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=20, null=True)
    gender = models.CharField(max_length=20, null=True)
    designation = models.CharField(max_length=100, null=True)
    role = models.ForeignKey(Role, related_name='users', on_delete=models.SET_NULL, null=True)
    career_start_date = models.DateField(null=True)
    career_break_months = models.IntegerField(default=0)
    date_of_joining = models.DateField(null=True)
    date_of_birth = models.DateField(null=True)
    last_working_day = models.DateField(null=True)
    location = models.CharField(max_length=50, null=True)
    work_location = models.CharField(max_length=50, null=True)
    country = models.CharField(max_length=50, null=True)
    employee_type = models.CharField(max_length=30, null=True)
    status = models.CharField(max_length=30, null=True)
    is_active = models.BooleanField(default=True)
    current_status = models.CharField(max_length=50, null=True)
    primary_skill = models.CharField(max_length=50, null=True)
    function = models.CharField(max_length=50, null=True)
    cb_profile_link = models.URLField(null=True)
    ga_profile_link = models.URLField(null=True)
    industries = models.ManyToManyField(Industry)
    reporting_to = models.ForeignKey('self', related_name='reportees', on_delete=models.SET_NULL, null=True)
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)
    skill_updated_time = models.DateTimeField(null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'

    class Meta:
        db_table = 'users'
        permissions = [('login', 'Can login'), ('search_talent', 'Can search talent'),
                       ('view_last_working_day', 'Can view last working day'),
                       ('generate_jwt_token', 'Can generate JWT token')]

    @property
    def user_role(self):
        """
        Return the role of the user.
        """
        group = self.groups.first()
        return group.name if group else None

    @property
    def roles(self):
        """
        Return roles associated with the user.
        """
        groups = self.groups.values_list('name', flat=True)
        return set(groups)

    @property
    def full_name(self):
        """
        Return the full name of the user.
        """
        full_name = "%s %s" % (self.first_name, self.last_name)
        return full_name.strip()

    @property
    def full_name_with_exp_band(self):
        """
        Returns the fullname of the user with experience band
        """
        full_name_with_band = f"{self.first_name} {self.last_name}" + (
            f" - {self.experience_band}" if self.experience_band else "")
        return full_name_with_band

    @property
    def experience_band(self):
        """
        Return the experience band of a user.
        """
        designation = self.designation if self.designation else ""
        match = re.search(r'\bL\d{1,2}\b', designation)
        if match:
            return match.group()
        return None

    @property
    def short_name(self):
        """
        Return the short name of the user.
        """
        return self.first_name

    @property
    def experience_months(self):
        """
        Return the experience of the user in months
        """
        if self.career_break_months is None:
            self.career_break_months = 0
        if self.career_start_date is not None:
            if self.last_working_day is not None and timezone.now().date() > self.last_working_day:
                return months_difference(self.career_start_date, self.last_working_day) - self.career_break_months
            else:
                return months_difference(self.career_start_date, timezone.now().date()) - self.career_break_months
        else:
            return 0

    @property
    def company_experience_months(self):
        if self.date_of_joining is not None:
            if self.last_working_day is not None and timezone.now().date() > self.last_working_day:
                return months_difference(self.date_of_joining, self.last_working_day)
            else:
                return months_difference(self.date_of_joining, timezone.now().date())
        else:
            return 0

    @cached_property
    def anniversary(self):
        if not self.date_of_joining:
            return
        date_of_joining = self.date_of_joining
        (years, months) = divmod(self.company_experience_months, 12)
        anniversary = date_of_joining + timezone.timedelta(days=365 * (years + 1))
        anniversary += timezone.timedelta(days=1)
        return anniversary


class ZohoInformation(models.Model):
    zoho_id = models.TextField(unique=True)
    user = models.OneToOneField(User, related_name='zoho_information', on_delete=models.CASCADE)
    created_time = models.DateTimeField(null=True)
    added_time = models.DateTimeField(null=True)
    modified_time = models.DateTimeField(null=True)

    class Meta:
        db_table = 'zoho_information'


class LeavePlans(models.Model):
    record_id = models.TextField(unique=True)
    user = models.ForeignKey(User, related_name='leave_plans', on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=50)
    from_date = models.DateField()
    to_date = models.DateField()
    duration = models.CharField(max_length=50)
    approval_status = models.CharField(max_length=50)

    class Meta:
        db_table = 'leave_plans'


class ProficiencyMapping(models.Model):
    user = models.ForeignKey(User, related_name='proficiency_mapping', on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, related_name='proficiency_mapping', on_delete=models.CASCADE)
    rating = models.IntegerField()

    class Meta:
        db_table = 'proficiency_mapping'
        unique_together = ('skill', 'user')
