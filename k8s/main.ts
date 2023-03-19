import { Construct } from 'constructs';
import { App } from 'cdk8s';
import { CronJob, PennLabsChart } from '@pennlabs/kittyhawk';

const cronTime = require('cron-time-generator');

export class MyChart extends PennLabsChart {
  constructor(scope: Construct) {
    super(scope);

    // const frontendImage = 'pennlabs/office-hours-queue-frontend';
    const backendImage = 'pennlabs/office-hours-queue-backend';
    const secret = 'office-hours-queue';
    // const domain = 'ohq.io';

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

const app = new App();
new MyChart(app);
app.synth();
