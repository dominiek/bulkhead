import React from 'react';
import { Segment, Message, Button, Divider, Header, Label } from 'semantic';

import screen from 'helpers/screen';
import Menu from './Menu';
import { request } from 'utils/api';

import { withSession } from 'stores';
import { Link } from 'react-router-dom';
import { Layout } from 'components';
import LoadButton from 'components/LoadButton';

@screen
@withSession
export default class Security extends React.Component {
  state = {
    error: null,
  };

  componentDidMount() {
    if (
      Date.parse(this.context.user.accessConfirmedAt) <
      Date.now() - 20 * 60 * 1000
    ) {
      this.props.history.push(
        `/confirm-access?to=${this.props.location.pathname}`
      );
    }
  }

  disableMFa = async () => {
    this.setState({ error: null });
    try {
      await request({
        method: 'DELETE',
        path: '/1/mfa/disable',
      });
      await this.context.reloadUser();
    } catch (e) {
      if (e.status === 403) {
        this.props.history.push(
          `/confirm-access?to=${this.props.location.pathname}`
        );
        return;
      } else {
        this.setState({ error: e });
      }
    }
  };

  render() {
    const { error } = this.state;
    const { mfaMethod } = this.context.user;

    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />

        <Header>Two-factor authentication</Header>
        <p>
          After logging, you will be required to enter a code using one of the
          methods below. You can always set up more than one method later.
        </p>
        <Divider hidden></Divider>

        <Segment.Group>
          <Segment>
            <Layout horizontal spread>
              <div>
                <Header
                  size="tiny"
                  style={{ marginTop: 0, marginBottom: '0.5em' }}>
                  App authentication{' '}
                  {mfaMethod === 'otp' && <Label color="green">Enabled</Label>}
                </Header>
                <p>
                  Security codes will be generated by your preferred
                  authenticator app.
                </p>
              </div>
              <div>
                <Button
                  basic
                  size="small"
                  to="/settings/mfa-authenticator"
                  as={Link}>
                  {mfaMethod === 'otp' ? 'Config' : 'Enable'}
                </Button>
              </div>
            </Layout>
          </Segment>
          <Segment>
            {error && <Message error content={error.message} />}
            <Layout horizontal spread>
              <div>
                <Header
                  size="tiny"
                  style={{ marginTop: 0, marginBottom: '0.5em' }}>
                  SMS authentication
                  {mfaMethod == 'sms' && <Label color="green">Enabled</Label>}
                </Header>
                <p>
                  Security codes will be sent via SMS to your mobile device.
                </p>
              </div>
              <div>
                <Button basic size="small" to="/settings/mfa-sms" as={Link}>
                  {mfaMethod === 'sms' ? 'Config' : 'Enable'}
                </Button>
              </div>
            </Layout>
          </Segment>
        </Segment.Group>
        {mfaMethod && (
          <>
            <Divider hidden></Divider>
            <Segment color="red">
              <Layout horizontal spread>
                <div>
                  <Header
                    size="tiny"
                    style={{ marginTop: 0, marginBottom: '0.5em' }}>
                    Turn off two-factor authentication
                  </Header>
                  <p>
                    Turning off two-factor authentication will remove an extra
                    layer of security on your account.
                  </p>
                </div>
                <div>
                  <LoadButton
                    onClick={this.disableMFa}
                    basic
                    size="small"
                    color="red">
                    Turn off
                  </LoadButton>
                </div>
              </Layout>
            </Segment>
          </>
        )}
      </React.Fragment>
    );
  }
}
