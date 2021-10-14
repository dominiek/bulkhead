import React from 'react';
import {
  Form,
  Message,
  Button,
  Loader,
  Header,
  Segment,
  Input,
} from 'semantic';
import { request } from 'utils/api';
import QACode from 'components/QRCode';
import { ExternalLink } from 'components/Link';

import screen from 'helpers/screen';
import PageCenter from 'components/PageCenter';
import { Link } from 'react-router-dom';
import LogoTitle from 'components/LogoTitle';
import Finalize from './Finalize';

@screen
export default class Authenticator extends React.Component {
  static layout = 'none';

  state = {
    loading: false,
    error: null,
    secret: undefined,
    code: '',
    secretUri: undefined,
  };

  componentDidMount() {
    this.fetchSecret();
  }

  async fetchSecret() {
    try {
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/mfa/config',
        body: {
          method: 'otp',
        },
      });

      this.setState({
        secret: data.secret,
        secretUri: data.uri,
        loading: false,
      });
    } catch (error) {
      if (error.status == 403) {
        this.props.history.push(
          '/confirm-access?to=/settings/mfa-authenticator'
        );
        return;
      }

      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSubmit = async () => {
    this.setState({
      loading: true,
    });

    try {
      await request({
        method: 'POST',
        path: '/1/auth/mfa/confirm-code',
        body: {
          code: this.state.code,
          secret: this.state.secret,
          method: 'otp',
        },
      });

      const { data } = await request({
        method: 'POST',
        path: '/1/auth/mfa/generate-codes',
      });

      this.setState({
        verified: true,
        codes: data,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { code, codes, loading, error, secretUri, secret, verified } =
      this.state;

    if (verified) {
      return (
        <Finalize
          codes={codes}
          requestBody={{
            secret,
            method: 'otp',
            backupCodes: codes,
          }}
        />
      );
    }

    return (
      <PageCenter>
        <LogoTitle title="Set up app authentication" />

        <Segment.Group>
          <Segment>
            <Header size="small">1. Download an authenticator app.</Header>
            <p>
              We recommend{' '}
              <ExternalLink href="https://support.google.com/accounts/answer/1066447">
                Google Authenticator
              </ExternalLink>
              ,{' '}
              <ExternalLink href="https://support.1password.com/one-time-passwords/">
                1Password
              </ExternalLink>
              , or <ExternalLink href="https://authy.com/">Authy.</ExternalLink>
            </p>
          </Segment>
          <Segment style={{ minHeight: '276px' }}>
            <Header size="small">
              2. Scan this barcode using your authenticator app
            </Header>

            {!secretUri && <Loader active />}

            {secretUri && (
              <QACode
                style={{ display: 'block', marginTop: '1em' }}
                data={secretUri}
              />
            )}
          </Segment>

          <Segment>
            <Header size="small">
              3. Enter the security code generated by your app
            </Header>
            <Form id="authenticator-form" onSubmit={this.onSubmit}>
              {error && <Message error content={error.message} />}
              <Input
                value={code}
                disabled={!secretUri}
                type="text"
                placeholder="E.g. 320881"
                onChange={(e, { value }) => this.setState({ code: value })}
              />
            </Form>
          </Segment>
          <Segment>
            <Button
              form="authenticator-form"
              primary
              loading={loading}
              disabled={loading || code.length !== 6}
              content={'Verify'}
            />
            <Button
              as={Link}
              to="/settings/security"
              basic
              floated="right"
              secondary
              content={'Cancel'}
            />
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}
