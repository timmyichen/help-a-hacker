import * as React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Header from 'client/Header';
import { Provider } from 'react-redux';
import initStore from 'client/store';
import fetch from 'isomorphic-fetch';
import withReduxStore from 'client/lib/withReduxStore';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};

    let user;
    if (ctx.req && ctx.req.user) {
      user = ctx.req.user;
    } else if (ctx.req) {
      const baseUrl = `${ctx.req.protocol}://${ctx.req.get('Host')}`;
      const response = await fetch(baseUrl + '/api/user_info');
      user = await response.json();
    } else {
      const response = await fetch('/api/user_info');
      user = await response.json();
    }

    if (user.error) {
      user = null;
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx, user);
    }

    return { pageProps: { ...pageProps, user } };
  }

  render() {
    const { Component, pageProps } = this.props;
    const user = pageProps.user || null;

    return (
      <Container>
        <Provider store={initStore({ user })}>
          <Head>
            <link
              href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
              rel="stylesheet"
            />
          </Head>
          <Header isAuthed={!!user} />
          <div className="component-wrapper">
            <Component {...pageProps} />
            <style jsx>{`
              .component-wrapper {
                background-image: linear-gradient(#d6f6dd, #b0cab5);
                min-height: 100vh;
              }
              :global(body) {
                color: #4e5a51;
              }
            `}</style>
          </div>
        </Provider>
      </Container>
    );
  }
}

export default withReduxStore(MyApp);
