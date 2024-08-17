from django.core.management import BaseCommand

from user.models import Skill

SKILLS = ['Account Management', 'Adobe Creative Suite', 'Agile Development', 'Airflow', 'Android', 'Angular', 'Ansible',
          'Apache Druid', 'Apache Pulsar', 'Apache Spark', 'API Automation', 'API Security Testing', 'Appium',
          'App Store Submission', 'AWS',
          'Azure Cloud', 'Bootstrap', 'Business Analysis', 'C', 'C#', 'C++', 'CI/CD', 'Clojure', 'CSS', 'Cypress',
          'Deep Learning',
          'Django', 'Docker', 'Dotnet Core', 'ELK/Elastic Search', 'Fastlane', 'Figma', 'Flink', 'Flutter',
          'GCP', 'Golang', 'Google PlayStore Submission', 'GraphQL', 'Hawaii Store Submission', 'Hibernate',
          'HTML', 'Invision', 'iOS App', 'Java', 'Javascript', 'Jenkins', 'Jest', 'JIRA', 'Jmeter', 'Jquery',
          'K8s', 'Kafka', 'Kotlin', 'Kubernetes', 'Laravel', 'LESS', 'Linux/Unix', 'Locust',
          'Machine Learning', 'Mobile Security Testing', 'MongoDB', 'MSSQL', 'MySQL', 'Neo4J', 'Nginx',
          'Node JS', 'Oracle', 'PHP', 'PLSQL', 'PostgreSQL', 'Postman API', 'PowerBI', 'Presto', 'Pre Sales',
          'Product Owner', 'Python', 'Project Management',
          'Pytorch', 'R Programming', 'RabbitMQ', 'React', 'React Native', 'Redis', 'Redux', 'Rest', 'ROR',
          'Ruby', 'Rust', 'RxJava', 'RxSwift', 'SAP Commerce Cloud', 'SAP CPI', 'SAP Hybris', 'SAST', 'Scala',
          'SCRUM Master', 'SCSS', 'Selenium', 'Shell Scripting/Bash', 'Shopify', 'Sketch', 'Solr',
          'Spring Boot', 'Spring MVC', 'Swift', 'Svelte', 'Tableau', 'Tensorflow', 'Teraform', 'Vala', 'VBA',
          'Vue.JS', 'Waterfall Development', 'Watermelon DB', 'Webdriverio', 'Web Security Testing', 'Zeplin']


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--create', action='store_true', required=True)

    def handle(self, *args, **options):
        if options['create']:
            self.create_skills()

    def create_skills(self):
        skills = [Skill(name=skill_name) for skill_name in SKILLS]
        Skill.objects.bulk_create(skills, ignore_conflicts=True)
