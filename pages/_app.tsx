import * as React from 'react';
import App, { Container } from 'next/app';
import Head from 'next/head';
import Header from 'client/Header';

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
        <Head>
          <link
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
            rel="stylesheet"
          />
        </Head>
        <Header />
        <Component {...pageProps} />
      </Container>
    );
  }
}

export default MyApp;
