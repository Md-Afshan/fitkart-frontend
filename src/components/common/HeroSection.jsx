import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-section__content">
        <p className="hero-section__eyebrow">FITKART FITNESS EQUIPMENT</p>

        <h1>Train stronger. Move better.</h1>

        <p className="hero-section__description">
          Quality fitness equipment for strength, cardio, and everyday training.
        </p>

        <Link to="/products" className="hero-section__cta">
          Shop Equipment
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>

      <div className="hero-section__media">
        <img
          src="/images/hero-fitness.jpg"
          alt="Fitness equipment in a modern training environment"
        />
      </div>
    </section>
  )
}

export default HeroSection
