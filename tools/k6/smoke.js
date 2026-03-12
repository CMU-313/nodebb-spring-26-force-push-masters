import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 3 },
    { duration: '10s', target: 5 },
    { duration: '5s', target: 0 },
  ],
};

export default function () {
  const home = http.get('http://17313-team05.s3d.cmu.edu:4567');
  check(home, {
    'home status 200': (r) => r.status === 200,
    'home under 1000ms': (r) => r.timings.duration < 1000,
  });

  const recent = http.get('http://17313-team05.s3d.cmu.edu:4567/recent');
  check(recent, {
    'recent status 200': (r) => r.status === 200,
    'recent under 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}