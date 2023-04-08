import { Construct } from 'constructs';
import { App } from 'cdk8s';
import { CronJob, DjangoApplication, PennLabsChart, ReactApplication, RedisApplication } from '@pennlabs/kittyhawk';

const cronTime = require('cron-time-generator');

export class MyChart extends PennLabsChart {
  constructor(scope: Construct) {
    super(scope);

    const frontendImage = 'pennlabs/office-hours-queue-frontend';
    const backendImage = 'pennlabs/office-hours-queue-backend';
    const secret = 'office-hours-queue';
    const domain = 'ohq.io';

    new DjangoApplication(this, 'django-asgi', {
      deployment: {
        image: backendImage,
        cmd: ['/usr/local/bin/asgi-run'],
        replicas: 2,
        secret,
        env: [
          { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' },
        ],
      },
      djangoSettingsModule: 'officehoursqueue.settings.production',
      domains: [{ host: domain, paths: ['/api/ws'] }],
    });

    new DjangoApplication(this, 'django-wsgi', {
      deployment: {
        image: backendImage,
        replicas: 2,
        secret,
        env: [
          { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' },
        ],
      },
      djangoSettingsModule: 'officehoursqueue.settings.production',
      domains: [{ host: domain, paths: ['/api', '/admin', '/assets'] }],
    });

    new ReactApplication(this, 'react', {
      deployment: {
        image: frontendImage,
        replicas: 2,
      },
      domain: { host: domain, paths: ['/'] },
      port: 80,
    });

    new RedisApplication(this, 'redis', {});

    new DjangoApplication(this, 'celery', {
      deployment: {
        image: backendImage,
        cmd: ['celery', '-A', 'officehoursqueue', 'worker', '-lINFO'],
        secret,
        env: [
          { name: 'REDIS_URL', value: 'redis://office-hours-queue-redis:6379' },
        ],
      },
      djangoSettingsModule: 'officehoursqueue.settings.production',
    });

    new CronJob(this, 'calculate-waits', {
      schedule: cronTime.every(5).minutes(),
      image: backendImage,
      secret: secret,
      cmd: ['python', 'manage.py', 'calculatewaittimes'],
    });

    new CronJob(this, 'queue-daily-stat', {
      schedule: cronTime.everyDayAt(8),
      image: backendImage,
      secret: secret,
      cmd: ['python', 'manage.py', 'queue_daily_stat'],
    });

    new CronJob(this, 'queue-heatmap-stat', {
      schedule: cronTime.everyDayAt(8),
      image: backendImage,
      secret: secret,
      cmd: ['python', 'manage.py', 'queue_heatmap_stat'],
    });

    new CronJob(this, 'calculate-course-stat', {
      schedule: cronTime.everyDayAt(8),
      image: backendImage,
      secret: secret,
      cmd: ['python', 'manage.py', 'course_stat'],
    });
  }
}

const app = new App({recordConstructMetadata: false});
new MyChart(app);
app.synth();
