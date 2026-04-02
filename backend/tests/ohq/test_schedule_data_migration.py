from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase
from django.utils import timezone

class TestScheduleDataMigration(TransactionTestCase):
    """Test the migration of schedule data from external 'schedule' app to internal 'ohq_schedule' app"""

    migrate_from = '0022_booking'
    migrate_to = '0023_migrate_schedule_data'

    @property
    def app(self):
        return 'ohq'

    def setUp(self):
        super().setUp()
        self.migrate_from = [
            (self.app, self.migrate_from),
            ('schedule', '0001_initial'), 
            ('ohq_schedule', '0015_event_bookable_event_interval_event_location_and_more')
        ]
        self.migrate_to = [(self.app, self.migrate_to)]
        
        self.executor = MigrationExecutor(connection)
        self.pre_migration = self.executor.loader.project_state(self.migrate_from).apps

        # Revert to the original migration
        self.executor.migrate(self.migrate_from)
        self.addCleanup(self.force_migrate)
        
        self.setUpBeforeMigration(self.pre_migration)

        # Apply the migration
        self.executor.loader.build_graph()
        self.executor.migrate(self.migrate_to)
        self.post_migration = self.executor.loader.project_state(self.migrate_to).apps

    def setUpBeforeMigration(self, apps):
        # Get old models
        Calendar = apps.get_model('schedule', 'Calendar')
        Event = apps.get_model('schedule', 'Event')
        Rule = apps.get_model('schedule', 'Rule')
        Occurrence = apps.get_model('schedule', 'Occurrence')
        CalendarRelation = apps.get_model('schedule', 'CalendarRelation')
        EventRelation = apps.get_model('schedule', 'EventRelation')

        # Create test data
        self.calendar = Calendar.objects.create(
            name="Test Calendar",
            slug="test-calendar"
        )

        self.rule = Rule.objects.create(
            name="Test Rule",
            description="Test Rule Description",
            frequency="WEEKLY",
            params="count:5"
        )

        current_time = timezone.now()
        self.event = Event.objects.create(
            start=current_time,
            end=current_time + timezone.timedelta(hours=1),
            title="Test Event",
            description="Test Event Description",
            calendar=self.calendar,
            rule=self.rule,
            end_recurring_period=current_time + timezone.timedelta(days=30),
        )

        self.occurrence = Occurrence.objects.create(
            event=self.event,
            title="Test Occurrence",
            description="Test Occurrence Description",
            start=current_time,
            end=current_time + timezone.timedelta(hours=1),
            original_start=current_time,
            original_end=current_time + timezone.timedelta(hours=1),
            cancelled=False
        )

        ContentType = apps.get_model('contenttypes', 'ContentType')
        content_type = ContentType.objects.get_or_create(
            app_label='ohq',
            model='course'
        )[0]

        self.calendar_relation = CalendarRelation.objects.create(
            calendar=self.calendar,
            content_type=content_type,
            object_id=1,
            distinction='test-distinction',
            inheritable=True
        )

        self.event_relation = EventRelation.objects.create(
            event=self.event,
            content_type=content_type,
            object_id=1,
            distinction='test-distinction'
        )

    def force_migrate(self, migrate_to=None):
        self.executor.loader.build_graph()
        if migrate_to is None:
            migrate_to = [
                key for key in self.executor.loader.graph.leaf_nodes() 
                if key[0] == self.app
            ]
        self.executor.migrate(migrate_to)

    def test_schedule_data_migrated(self):
        # Get new models
        NewCalendar = self.post_migration.get_model('ohq_schedule', 'Calendar')
        NewEvent = self.post_migration.get_model('ohq_schedule', 'Event')
        NewRule = self.post_migration.get_model('ohq_schedule', 'Rule')
        NewOccurrence = self.post_migration.get_model('ohq_schedule', 'Occurrence')
        NewCalendarRelation = self.post_migration.get_model('ohq_schedule', 'CalendarRelation')
        NewEventRelation = self.post_migration.get_model('ohq_schedule', 'EventRelation')

        # Test Calendar migration
        new_calendar = NewCalendar.objects.get(id=self.calendar.id)
        self.assertEqual(new_calendar.name, self.calendar.name)
        self.assertEqual(new_calendar.slug, self.calendar.slug)

        # Test Rule migration
        new_rule = NewRule.objects.get(id=self.rule.id)
        self.assertEqual(new_rule.name, self.rule.name)
        self.assertEqual(new_rule.description, self.rule.description)
        self.assertEqual(new_rule.frequency, self.rule.frequency)
        self.assertEqual(new_rule.params, self.rule.params)

        # Test Event migration
        new_event = NewEvent.objects.get(id=self.event.id)
        self.assertEqual(new_event.title, self.event.title)
        self.assertEqual(new_event.description, self.event.description)
        self.assertEqual(new_event.location, '')  # Default value
        self.assertEqual(new_event.bookable, False)  # Default value
        self.assertIsNone(new_event.interval)  # Default value

        # Test Occurrence migration
        new_occurrence = NewOccurrence.objects.get(id=self.occurrence.id)
        self.assertEqual(new_occurrence.title, self.occurrence.title)
        self.assertEqual(new_occurrence.description, self.occurrence.description)
        self.assertEqual(new_occurrence.cancelled, self.occurrence.cancelled)
        self.assertEqual(new_occurrence.location, '')  # Default value
        self.assertIsNone(new_occurrence.interval)  # Default value

        # Test Relations migration
        new_calendar_relation = NewCalendarRelation.objects.get(
            id=self.calendar_relation.id
        )
        self.assertEqual(
            new_calendar_relation.distinction,
            self.calendar_relation.distinction
        )
        self.assertEqual(
            new_calendar_relation.inheritable,
            self.calendar_relation.inheritable
        )

        new_event_relation = NewEventRelation.objects.get(
            id=self.event_relation.id
        )
        self.assertEqual(
            new_event_relation.distinction,
            self.event_relation.distinction
        )