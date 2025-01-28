import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Loader, Header, Segment } from 'semantic';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';

import { ExternalLink } from 'components/Link';
import Layout from 'components/Layout';
import LogoTitle from 'components/LogoTitle';
import Code from 'components/form-fields/Code';
import ErrorMessage from 'components/ErrorMessage';
import QRCode from 'components/QRCode';

import { request } from 'utils/api';

@screen
@withSession
export default class Authenticator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      url: null,
      secret: null,
      code: '',
    };
  }

  componentDidMount() {
    this.request();
  }

  async request() {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/totp/request',
      });
      this.setState({
        url: data.url,
        secret: data.secret,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  setCode = (evt, { value }) => {
    this.setState({
      code: value,
    });
  };

  onSubmitCode = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { code, secret } = this.state;
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/totp/enable',
        body: {
          code,
          secret,
        },
      });
      this.context.updateUser(data);
      this.props.history.push('/settings/security');
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { code, loading, error } = this.state;

    return (
      <React.Fragment>
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
            <Layout center>{this.renderQrCode()}</Layout>
          </Segment>
          <Form onSubmit={this.onSubmitCode}>
            <Segment>
              <Header size="small">
                3. Enter the security code generated by your app
              </Header>
              <ErrorMessage error={error} />
              <Layout center>
                <Code value={code} disabled={loading} onChange={this.setCode} />
              </Layout>
            </Segment>
            <Segment>
              <Button
                as={Link}
                to="/settings/security"
                basic
                secondary
                content="Cancel"
              />
              <Button
                primary
                type="submit"
                floated="right"
                loading={loading}
                disabled={loading || code.length !== 6}
                content={'Verify'}
              />
            </Segment>
          </Form>
        </Segment.Group>
      </React.Fragment>
    );
  }

  renderQrCode() {
    const { url } = this.state;
    if (url) {
      return (
        <QRCode
          data={url}
          style={{
            display: 'block',
            marginTop: '1em',
          }}
        />
      );
    } else {
      return <Loader active />;
    }
  }
}
