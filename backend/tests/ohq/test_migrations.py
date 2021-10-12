from django.db import connection
from django.db.migrations.executor import MigrationExecutor
from django.test import TransactionTestCase

from ohq.models import Semester


class MigrationTest(TransactionTestCase):
    """
    Test applying a new migration on top of an old migration.
        Make sure that `self.migrate_from` and `self.migrate_to` are defined, and also implement
        `setUpBeforeMigration()` to setup the model before migrations are applied.
    """

    migrate_from = None  # need to be defined by subclasses
    migrate_to = None  # need to be defined by subclasses

    @property
    def app(self):
        return "ohq"

    def setUp(self):
        super().setUp()
        assert (
            self.migrate_to and self.migrate_from
        ), f"TestCase {type(self).__name} must define migrate_to and migrate_from properties"

        self.migrate_from = [(self.app, self.migrate_from)]
        self.migrate_to = [(self.app, self.migrate_to)]
        self.executor = MigrationExecutor(connection)
        self.pre_migration = self.executor.loader.project_state(self.migrate_from).apps

        # revert to the original migration
        self.executor.migrate(self.migrate_from)

        # ensure return to the latest migration, even if the test fails
        self.addCleanup(self.force_migrate)

        # perform final migration setup
        self.setUpBeforeMigration(self.pre_migration)

        # Finally apply the migration
        self.executor.loader.build_graph()
        self.executor.migrate(self.migrate_to)
        self.post_migration = self.executor.loader.project_state(self.migrate_to).apps

    # Implement in subclasses to setup models before applying a migration
    def setUpBeforeMigration(self, apps):
        pass

    # forces a migration to the latest migration even if tests fail
    def force_migrate(self, migrate_to=None):
        self.executor.loader.build_graph()  # reload.
        if migrate_to is None:
            # get latest migration of current app
            migrate_to = [
                key for key in self.executor.loader.graph.leaf_nodes() if key[0] == self.app
            ]

        self.executor.migrate(migrate_to)


class TestQuestionTemplatesMigration(MigrationTest):
    migrate_from = "0014_question_student_descriptor"
    migrate_to = "0015_question_templates"

    def setUpBeforeMigration(self, pre_migration):
        self.semester = pre_migration.get_model(self.app, "Semester").objects.create(
            year=2020, term=Semester.TERM_SUMMER
        )
        self.course = pre_migration.get_model(self.app, "Course").objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.queue = pre_migration.get_model(self.app, "Queue").objects.create(
            name="Queue", course=self.course
        )

    def test_question_templates_migrated(self):
        queue = self.post_migration.get_model(self.app, "Queue").objects.get(id=self.queue.id)

        # The queue created before migration now has a question_template attribute
        self.assertIs(hasattr(queue, "question_template"), True)

        # The question_template is "" by default
        self.assertIs(queue.question_template, "")

class TestQueueTimersMigration(MigrationTest):
    migrate_from = "0015_question_templates"
    migrate_to = "0016_queue_timers"

    def setUpBeforeMigration(self, pre_migration):
        self.semester = pre_migration.get_model(self.app, "Semester").objects.create(
            year=2020, term=Semester.TERM_SUMMER
        )
        self.course = pre_migration.get_model(self.app, "Course").objects.create(
            course_code="000", department="Penn Labs", semester=self.semester
        )
        self.queue = pre_migration.get_model(self.app, "Queue").objects.create(
            name="Queue", course=self.course
        )

    def test_question_templates_migrated(self):
        queue = self.post_migration.get_model(self.app, "Queue").objects.get(id=self.queue.id)

        # The queue created before migration now has both timers
        self.assertIs(hasattr(queue, "fst_timer"), True)
        self.assertIs(hasattr(queue, "snd_timer"), True)

        # Both timers are None.
        self.assertIs(queue.fst_timer, 0)
        self.assertIs(queue.snd_timer, 0)
