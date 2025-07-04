import Head from "next/head";
import { StartPage } from "src/components/StartPage";

export default function Home() {
  return (
    <>
      <Head>
        <title>Project Web-Vend</title>
        <meta name="description" content="An experiment in autonomous AI strategy." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <StartPage />
      </main>
    </>
  );
}