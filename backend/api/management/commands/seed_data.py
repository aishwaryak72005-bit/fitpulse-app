from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Disabled seed data for clean production environment.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Seed data is disabled. FitPulse is operating in clean production mode.'))
