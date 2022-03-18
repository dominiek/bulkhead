import React from 'react';
import { Image, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Table, Button, Divider, Confirm } from 'semantic';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';
import screen from 'helpers/screen';

import { HelpTip, Breadcrumbs, Layout } from 'components';
import { SearchProvider, Filters, Export, Status } from 'components/search';
import EditProduct from 'modals/EditProduct';

@screen
export default class ProductList extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: params,
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items: products, getSorted, setSort, reload, registerParam }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Products" />

              <Layout horizontal center spread>
                <h1>Products</h1>
                <Layout.Group>
                  <Export filename="products" />
                  <EditProduct
                    trigger={
                      <Button primary content="New Product" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              <Segment>
                <Layout horizontal center spread stackable>
                  <Layout horizontal>
                    <Filters.Modal>
                      <Filters.Checkbox
                        {...registerParam({
                          name: 'isFeatured',
                          label: 'Is Featured',
                          type: 'boolean',
                        })}
                      />
                      <Filters.Number
                        {...registerParam({
                          name: 'priceUsd',
                          label: 'Price Usd',
                          type: 'currency',
                        })}
                      />
                      <Filters.DateRange
                        time
                        {...registerParam({
                          name: 'expiresAt',
                          label: 'Expires At',
                          type: 'date',
                        })}
                      />
                      <Filters.Dropdown
                        search
                        multiple
                        selection
                        allowAdditions
                        {...registerParam({
                          name: 'sellingPoints',
                          label: 'Selling Points',
                        })}
                      />
                    </Filters.Modal>
                    <Filters.Overview />
                  </Layout>

                  <Layout.Group>
                    <Filters.Search
                      placeholder="Enter name or id"
                      {...registerParam({
                        name: 'keyword',
                      })}
                    />
                  </Layout.Group>
                </Layout>
              </Segment>
              <Status />
              {products.length !== 0 && (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell>Images</Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('priceUsd')}
                        sorted={getSorted('priceUsd')}>
                        Price
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
                        Created
                        <HelpTip
                          title="Created"
                          text="This is the date and time the product was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {products.map((product) => {
                      return (
                        <Table.Row key={product.id}>
                          <Table.Cell>
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {product.images[0] && (
                              <Image
                                size="tiny"
                                src={urlForUpload(product.images[0], true)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>{formatUsd(product.priceUsd)}</Table.Cell>
                          <Table.Cell>
                            {formatDateTime(product.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditProduct
                              product={product}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${product.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/products/${product.id}`,
                                });
                                reload();
                              }}
                            />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
              <Divider hidden />
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}
