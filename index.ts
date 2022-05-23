import express from 'express';
import ld from 'launchdarkly-node-server-sdk';
import { Snowflake } from 'snowflake-promise';

class LaunchDarkly {
  private client: ld.LDClient;
  async init(apiKey) {
    this.client = ld.init(apiKey);

    this.client.on('ready', () => {
      console.log('LaunchDarkly client successfully initialized.');
    });

    this.client.on('failed', () => {
      console.log('LaunchDarkly client failed to connect.');
    });

    this.client.on('error', () => {
      console.log('LaunchDarkly client has been disconnected.');
    });

    this.client.on('update', (event) => {
      console.log(`A key was updated in LaunchDarkly: ${event.key}.`);
    });
  }

  async getVariation(variationKey, userKey, defaultValue) {
    if (!this.client.initialized()) {
      console.log(`LaunchDarkly is unavailable, returning default value ${defaultValue} for user ${userKey}`);
      return defaultValue;
    } else {
      const retval = await this.client.variation(variationKey, { key: userKey }, defaultValue);
      console.log(`Evaluated flag ${variationKey} for user ${userKey} as ${retval}`);
      return retval;
    }
  }

  async close() {
    await this.client.flush();
    this.client.close();
  }
}

const snowflakeClient = async () => {
  const snowflake = new Snowflake({
      account: 'foo',
      username: 'foo',
      password: 'foo',
      database: 'foo',
      schema: 'foo'
  });
  return snowflake;
};

const app = express();

const ldClient = new LaunchDarkly();
ldClient.init('API_KEY');

app.listen(3000, '0.0.0.0', async () => {
  console.log(`Server is listening on port 3000`);
});
