import { CartProvider } from './components/cart/CartProvider'
import { CartDrawer } from './components/cart/CartDrawer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Social } from './components/sections/Social'
import { Teardown } from './components/sections/Teardown'
import { Flow } from './components/sections/Flow'
import { Playground } from './components/sections/Playground'
import { Audiences } from './components/sections/Audiences'
import { Faq } from './components/sections/Faq'
import { Closing } from './components/sections/Closing'
import { Footer } from './components/sections/Footer'

export default function Home() {
  return (
    <CartProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Teardown />
        <Social />
        <Flow />
        <Playground />
        <Audiences />
        <Faq />
        <Closing />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
