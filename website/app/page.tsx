import { CartProvider } from './components/cart/CartProvider'
import { CartDrawer } from './components/cart/CartDrawer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Proof } from './components/sections/Proof'
import { WhyPhysical } from './components/sections/WhyPhysical'
import { AgentBody } from './components/sections/AgentBody'
import { HowItWorks } from './components/sections/HowItWorks'
import { Playground } from './components/sections/Playground'
import { Specs } from './components/sections/Specs'
import { GetYours } from './components/sections/GetYours'
import { Faq } from './components/sections/Faq'
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
        <Proof />
        <WhyPhysical />
        <AgentBody />
        <HowItWorks />
        <Playground />
        <Specs />
        <GetYours />
        <Faq />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
