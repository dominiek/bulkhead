import React from 'react';
import { pick } from 'lodash';
import { Segment, Form, Button, Divider } from 'semantic';

import { withSession } from 'stores/session';

import screen from 'helpers/screen';

import ErrorMessage from 'components/ErrorMessage';
import PhoneField from 'components/form-fields/Phone';
import EmailField from 'components/form-fields/Email';

import { request } from 'utils/api';

import Menu from './Menu';

@screen
@withSession
export default class Profile extends React.Component {
  state = {
    user: pick(this.context.user, ['firstName', 'lastName', 'phone', 'email']),
  };

  setField = (evt, { name, value }) => {
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
    });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  async save() {
    const { user } = this.state;
    try {
      this.setState({
        loading: true,
        error: null,
      });
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: user,
      });
      this.context.updateUser(data);
      this.setState({
        error: false,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  render() {
    const { user, error, loading } = this.state;
    if (!this.context.user) {
      return null;
    }

    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <ErrorMessage error={error} />
        <Form onSubmit={() => this.save()}>
          <Segment>
            <Form.Input
              type="text"
              name="firstName"
              label="First Name"
              value={user.firstName || ''}
              onChange={this.setField}
            />
            <Form.Input
              type="text"
              name="lastName"
              label="Last Name"
              value={user.lastName || ''}
              onChange={this.setField}
            />
            {user.phone && (
              <PhoneField
                disabled
                name="phone"
                label="Phone Number"
                value={user.phone || ''}
                onChange={this.setField}
              />
            )}
            {user.email && (
              <EmailField
                disabled
                name="email"
                label="Email"
                value={user.email || ''}
              />
            )}
          </Segment>
          <div>
            <Button
              primary
              content="Save"
              loading={loading}
              disabled={loading}
            />
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
