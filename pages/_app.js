import "@/styles/globals.css";
import BackgroundMusic from '../components/BackgroundMusic';
// import { MusicModal } from '../components/ui/MusicModal';

export default function App({ Component, pageProps }) {
  return (
    <>
      <BackgroundMusic />
      <Component {...pageProps} />
      {/* <MusicModal /> */}
    </>
  );
}
