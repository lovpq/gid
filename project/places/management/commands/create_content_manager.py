from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from places.models import Place, Image


class Command(BaseCommand):
    help = 'Создает учетную запись контент-менеджера с необходимыми разрешениями'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Имя пользователя')
        parser.add_argument('password', type=str, help='Пароль')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']

        group, created = Group.objects.get_or_create(name='Content Managers')
        
        if created:
            place_content_type = ContentType.objects.get_for_model(Place)
            image_content_type = ContentType.objects.get_for_model(Image)
            
            permissions = Permission.objects.filter(
                content_type__in=[place_content_type, image_content_type]
            )
            group.permissions.set(permissions)
            self.stdout.write(
                self.style.SUCCESS(f'Создана группа "Content Managers" с разрешениями')
            )

        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.WARNING(f'Пользователь "{username}" уже существует. Пароль обновлен.')
            )
        else:
            user = User.objects.create_user(
                username=username,
                password=password,
                is_staff=True
            )
            self.stdout.write(
                self.style.SUCCESS(f'Создан пользователь "{username}"')
            )

        user.groups.add(group)
        self.stdout.write(
            self.style.SUCCESS(
                f'Пользователь "{username}" добавлен в группу "Content Managers"'
            )
        )

