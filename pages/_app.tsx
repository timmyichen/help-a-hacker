import * as React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Header from 'client/Header';
import { Provider } from 'react-redux';
import initStore from 'client/store';
import withReduxStore from 'client/lib/withReduxStore';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Provider store={initStore()}>
          <Head>
            <link
              href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
              rel="stylesheet"
            />
          </Head>
          <Header isAuthed={false} />
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withReduxStore(MyApp);
