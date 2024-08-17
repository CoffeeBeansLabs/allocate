from unittest.mock import patch

from django.test import TestCase
from django.core.management import call_command
from user.models import User
import os


class ImportUserDataTestCase(TestCase):
    @classmethod
    def setUpClass(cls):
        os.environ.setdefault("DJANGO_SETTINGS_MODULE",
                              "staffing_tool.settings.local")
        super().setUpClass()

    @patch("user.management.commands.import_user_data.Command.get_leave_plans")
    @patch("user.management.commands.import_user_data.Command.get_user_data")
    @patch("user.management.commands.import_user_data.Command.get_token")
    def test_import_user_happy_path(self, mock_access_token, mock_user_data, mock_leave_plans):
        user_data = [{'123456': [{'EmailID': 'example@example.com',
                                  'CreatedTime': '1719823800508', 'Employee_type.id': '1234',
                                  'Address': 'Permanent - something\n\nCurrent - something',
                                  'Date_of_birth': '01-Jun-1991', 'Support_Staff.id': '123456',
                                  'Employee_Band': 'L3', 'Photo':
                                  'https://contacts.zoho.in/file?ID=1234&fs=thumb',
                                  'AddedTime': '01-Jul-2024 14:20:00', 'Marital_status':
                                  'Single', 'Gender': 'Male', 'ModifiedBy': '111 - abc',
                                  'ApprovalStatus': 'Approval Not Enabled', 'Department':
                                  'Talent Acquisition', 'LocationName.ID': '129490000000136006',
                                  'tabularSections': {'Education': [{}], 'Work experience': [{}],
                                                      'Dependent': [{}]}, 'Mobile.country_code':
                                  'in', 'AddedBy': '111 - abc', 'Tags': '',
                                  'Reporting_To': 'Somebody 123',
                                  'Photo_downloadUrl':
                                  'https://contacts.zoho.in/file?ID=1234&fs=thumb',
                                  'Source_of_hire.id': '1234', 'total_experience.displayValue':
                                  '', 'Employeestatus': 'Active', 'Role': 'Team member',
                                  'Employee_Band.id': '1234', 'Experience': '0',
                                  'Employee_type': 'Permanent', 'Support_Staff': 'Yes', 'AddedBy.ID':
                                  '12345', 'Role.ID': '12345', 'LastName': 'Some LastName', 'EmployeeID':
                                  '111', 'ZUID': '123456', 'Current_Job_Description': '', 'Dateofexit': '',
                                  'Other_Email': '', 'Work_location': 'Bangalore', 'LocationName': 'Bangalore',
                                  'Nick_Name': '', 'total_experience': '0', 'ModifiedTime': '1719823800508',
                                  'Reporting_To.MailID': 'example@example.com', 'Zoho_ID': 123456,
                                  'Designation.ID': '129490000013397076', 'Source_of_hire': 'Referral',
                                  'Age': '33', 'Designation': 'Talent Acquisition Specialist',
                                  'Age.displayValue': '33 year(s) 1 month(s)', 'Marital_status.id':
                                  '129490000000039985', 'FirstName': 'Abhilash', 'Dateofjoining':
                                  '01-Jul-2024', 'AboutMe': '', 'Experience.displayValue': '',
                                  'Mobile': '91-9066690992', 'Extension': '', 'ModifiedBy.ID': '129490000003491133',
                                  'Reporting_To.ID': '129490000010112001', 'Work_phone': '', 'Employeestatus.type': 1,
                                  'Department.ID': '129490000003698230', 'Expertise': ''}]}]
        mock_leave_plans.return_value = []
        mock_access_token.return_value = 'ABC'
        mock_user_data.return_value = user_data
        call_command('import_user_data', days=1)
        user = User.objects.filter(employee_id="111").first()
        self.assertIsNotNone(user)

    @patch("user.management.commands.import_user_data.Command.get_leave_plans")
    @patch("user.management.commands.import_user_data.Command.get_user_data")
    @patch("user.management.commands.import_user_data.Command.get_token")
    def test_import_users_happy_path(self, mock_access_token, mock_user_data, mock_leave_plans):
        user_data = [{'123456': [{'EmailID': 'example@example.com', 'CreatedTime':
                                  '1719823800508', 'Employee_type.id': '1234', 'Address':
                                  'Permanent - something\n\nCurrent - something', 'Date_of_birth':
                                  '01-Jun-1991', 'Support_Staff.id': '123456', 'Employee_Band': 'L3',
                                  'Photo': 'https://contacts.zoho.in/file?ID=1234&fs=thumb', 'AddedTime':
                                  '01-Jul-2024 14:20:00', 'Marital_status': 'Single', 'Gender': 'Male',
                                  'ModifiedBy': '111 - abc', 'ApprovalStatus': 'Approval Not Enabled',
                                  'Department': 'Talent Acquisition', 'LocationName.ID': '129490000000136006',
                                  'tabularSections': {'Education': [{}], 'Work experience': [{}], 'Dependent': [{}]},
                                  'Mobile.country_code': 'in', 'AddedBy': '111 - abc', 'Tags': '', 'Reporting_To':
                                  'Somebody 123', 'Photo_downloadUrl': 'https://contacts.zoho.in/file?ID=1234&fs=thumb',
                                  'Source_of_hire.id': '1234', 'total_experience.displayValue': '', 'Employeestatus':
                                      'Active', 'Role': 'Team member', 'Employee_Band.id': '1234', 'Experience': '0',
                                  'Employee_type': 'Permanent', 'Support_Staff': 'Yes', 'AddedBy.ID': '12345',
                                  'Role.ID': '12345', 'LastName': 'Some LastName', 'EmployeeID': '111', 'ZUID':
                                  '123456', 'Current_Job_Description': '', 'Dateofexit': '', 'Other_Email':
                                  '', 'Work_location': 'Bangalore', 'LocationName': 'Bangalore', 'Nick_Name':
                                  '', 'total_experience': '0', 'ModifiedTime': '1719823800508',
                                  'Reporting_To.MailID': 'example@example.com', 'Zoho_ID': 123456,
                                  'Designation.ID': '129490000013397076', 'Source_of_hire': 'Referral',
                                  'Age': '33', 'Designation': 'Talent Acquisition Specialist',
                                  'Age.displayValue': '33 year(s) 1 month(s)', 'Marital_status.id':
                                  '129490000000039985', 'FirstName': 'Abhilash', 'Dateofjoining':
                                  '01-Jul-2024', 'AboutMe': '', 'Experience.displayValue': '', 'Mobile':
                                  '91-9066690992', 'Extension': '', 'ModifiedBy.ID': '129490000003491133',
                                  'Reporting_To.ID': '129490000010112001', 'Work_phone': '',
                                  'Employeestatus.type': 1, 'Department.ID': '129490000003698230',
                                  'Expertise': ''}]}, {"789012": [
                                      {"EmailID": "johndoe@example.com", "CreatedTime":
                                       "1720910400000", "Employee_type.id": "5678", "Address":
                                       "Permanent - 123 Main St, Anytown, USA\n\nCurrent - 456 Oak Ave, Somecity, USA",
                                       "Date_of_birth": "15-Aug-1988", "Support_Staff.id": "789012",
                                       "Employee_Band": "L4", "Photo":
                                       "https://contacts.zoho.in/file?ID=5678&fs=thumb", "AddedTime":
                                       "15-Jul-2024 09:30:00", "Marital_status": "Married", "Gender":
                                       "Female", "ModifiedBy": "222 - xyz",
                                       "ApprovalStatus": "Approved", "Department": "Software Development",
                                       "LocationName.ID": "129490000000136007", "tabularSections":
                                       {"Education": [{}], "Work experience": [
                                           {}], "Dependent": [{}]},
                                          "Mobile.country_code": "us", "AddedBy": "222 - xyz", "Tags":
                                          "Developer, Team Lead", "Reporting_To":
                                          "Jane Smith 456", "Photo_downloadUrl":
                                          "https://contacts.zoho.in/file?ID=5678&fs=thumb",
                                          "Source_of_hire.id": "5678", "total_experience.displayValue":
                                          "8 years", "Employeestatus": "Active", "Role": "Team Lead",
                                          "Employee_Band.id": "5678", "Experience": "8", "Employee_type":
                                          "Full-time", "Support_Staff": "No", "AddedBy.ID": "67890",
                                          "Role.ID": "67890", "LastName": "Doe", "EmployeeID": "113", "ZUID": "789012",
                                          "Current_Job_Description":
                                          "Lead software development team and manage projects", "Dateofexit":
                                          "", "Other_Email": "johndoe@personal.com",
                                          "Work_location": "New York", "LocationName": "New York", "Nick_Name":
                                          "Johnny", "total_experience": "8", "ModifiedTime": "1720910400000",
                                       "Reporting_To.MailID": "example@example.com", "Zoho_ID": 789012,
                                       "Designation.ID": "129490000013397077", "Source_of_hire": "LinkedIn",
                                       "Age": "35", "Designation": "Senior Software Engineer", "Age.displayValue":
                                          "35 year(s) 11 month(s)", "Marital_status.id": "129490000000039986",
                                          "FirstName": "John", "Dateofjoining": "15-Jul-2024", "AboutMe":
                                          "Passionate about clean code and innovative solutions",
                                          "Experience.displayValue": "8 years", "Mobile": "1-5551234567",
                                          "Extension": "4567", "ModifiedBy.ID": "129490000003491134",
                                          "Reporting_To.ID": "129490000010112002", "Work_phone": "1-9876543210",
                                       "Employeestatus.type": 1, "Department.ID": "129490000003698231",
                                          "Expertise": "Java, Python, Agile methodologies"}]}]
        mock_leave_plans.return_value = []
        mock_access_token.return_value = 'ABC'
        mock_user_data.return_value = user_data
        call_command('import_user_data', days=1)
        user = User.objects.filter(employee_id="111").first()
        user2 = User.objects.filter(employee_id="113").first()
        self.assertIsNotNone(user)
        self.assertIsNotNone(user2)

    @patch("user.management.commands.import_user_data.Command.get_leave_plans")
    @patch("user.management.commands.import_user_data.Command.get_user_data")
    @patch("user.management.commands.import_user_data.Command.get_token")
    def test_import_user_sad_path(self, mock_access_token, mock_user_data, mock_leave_plans):
        # A user has email and employee_id that already exist with 2 different entries in the database
        User.objects.create_user(employee_id="1", email='user@company.io', first_name='Foo', last_name='Bar',
                                 status='Active')
        User.objects.create_user(employee_id="2", email='user2@company.io', first_name='Foo', last_name='Bar',
                                 status='Active')

        user_data = [{'123456': [{'EmailID': 'user@company.io', 'CreatedTime': '1719823800508',
                                  'Employee_type.id': '1234', 'Address': 'Permanent - something\n\nCurrent - something',
                                  'Date_of_birth': '01-Jun-1991', 'Support_Staff.id': '123456', 'Employee_Band': 'L3',
                                  'Photo': 'https://contacts.zoho.in/file?ID=1234&fs=thumb', 'AddedTime':
                                      '01-Jul-2024 14:20:00', 'Marital_status': 'Single', 'Gender': 'Male',
                                      'ModifiedBy': '111 - abc', 'ApprovalStatus': 'Approval Not Enabled',
                                      'Department': 'Talent Acquisition', 'LocationName.ID': '129490000000136006',
                                      'tabularSections': {'Education': [{}], 'Work experience': [{}], 'Dependent':
                                                          [{}]}, 'Mobile.country_code': 'in', 'AddedBy': '111 - abc',
                                  'Tags': '', 'Reporting_To': 'Somebody 123',
                                  'Photo_downloadUrl':
                                  'https://contacts.zoho.in/file?ID=1234&fs=thumb',
                                  'Source_of_hire.id': '1234', 'total_experience.displayValue':
                                  '', 'Employeestatus': 'Active', 'Role': 'Team member', 'Employee_Band.id':
                                  '1234', 'Experience': '0',
                                  'Employee_type': 'Permanent', 'Support_Staff': 'Yes', 'AddedBy.ID': '12345',
                                  'Role.ID': '12345', 'LastName': 'Some LastName', 'EmployeeID': '2', 'ZUID':
                                  '123456', 'Current_Job_Description': '', 'Dateofexit': '', 'Other_Email': '',
                                  'Work_location': 'Bangalore', 'LocationName': 'Bangalore', 'Nick_Name': '',
                                  'total_experience': '0', 'ModifiedTime': '1719823800508', 'Reporting_To.MailID':
                                      '', 'Zoho_ID': 123456, 'Designation.ID': '129490000013397076', 'Source_of_hire':
                                  'Referral', 'Age': '33', 'Designation': 'Talent Acquisition Specialist',
                                  'Age.displayValue': '33 year(s) 1 month(s)', 'Marital_status.id':
                                  '129490000000039985', 'FirstName': 'Tester', 'Dateofjoining': '01-Jul-2024',
                                  'AboutMe': '', 'Experience.displayValue': '', 'Mobile': '91-9066690992',
                                  'Extension': '', 'ModifiedBy.ID': '129490000003491133', 'Reporting_To.ID':
                                  '129490000010112001', 'Work_phone': '', 'Employeestatus.type': 1, 'Department.ID':
                                  '129490000003698230', 'Expertise': ''}]}]
        mock_leave_plans.return_value = []
        mock_access_token.return_value = 'ABC'
        mock_user_data.return_value = user_data
        call_command('import_user_data', days=1)
        user = User.objects.filter(first_name="Tester").first()
        self.assertIsNone(user)
