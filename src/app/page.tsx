'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  Star, 
  ArrowRight,
  BarChart3,
  Wallet,
  Users
} from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        setShowLanding(true)
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center animate-pulse">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">CryptoEarn Pro</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!showLanding) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CryptoEarn Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="gradient-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="mx-auto">
              🚀 Trusted by 10,000+ investors worldwide
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Earn Daily Returns on
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Crypto Investments</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Join the future of passive income with our professional crypto earning platform. 
              Start with as little as $100 and earn up to 3% daily returns on your investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="gradient-primary text-lg px-8 py-6">
                  Start Earning Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">$2.5M+</div>
              <div className="text-muted-foreground">Total Invested</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-success">10,000+</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-warning">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CryptoEarn Pro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the most advanced crypto earning platform with institutional-grade security and transparency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Bank-Level Security</CardTitle>
                <CardDescription>
                  Your investments are protected with military-grade encryption and multi-signature wallets.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Daily Payouts</CardTitle>
                <CardDescription>
                  Receive your earnings every 24 hours directly to your account balance automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Track your investments and earnings with comprehensive analytics and reporting tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-warning" />
                </div>
                <CardTitle>Multiple Cryptocurrencies</CardTitle>
                <CardDescription>
                  Invest with Bitcoin, Ethereum, USDT, and other major cryptocurrencies seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-info" />
                </div>
                <CardTitle>Referral Program</CardTitle>
                <CardDescription>
                  Earn additional income by referring friends and family to our platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-0 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle>Global Access</CardTitle>
                <CardDescription>
                  Available worldwide with support for multiple languages and currencies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Plans */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investment Plans
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan that matches your investment goals and risk tolerance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Tier 1: Explorer",
                rate: "1.5%",
                duration: "30 days",
                min: "$100",
                max: "$1,000",
                total: "45%",
                popular: false
              },
              {
                name: "Tier 2: Investor",
                rate: "2.0%",
                duration: "45 days",
                min: "$1,000",
                max: "$5,000",
                total: "90%",
                popular: true
              },
              {
                name: "Tier 3: Elite",
                rate: "2.5%",
                duration: "60 days",
                min: "$5,000",
                max: "$25,000",
                total: "150%",
                popular: false
              },
              {
                name: "Tier 4: Premium",
                rate: "3.0%",
                duration: "90 days",
                min: "$25,000",
                max: "$100,000",
                total: "270%",
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`glass border-0 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.rate}</div>
                  <CardDescription>Daily Returns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{plan.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Min Deposit:</span>
                      <span className="font-medium">{plan.min}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Deposit:</span>
                      <span className="font-medium">{plan.max}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Return:</span>
                      <span className="font-medium text-success">{plan.total}</span>
                    </div>
                  </div>
                  <Link href="/auth/register" className="block">
                    <Button className={`w-full ${plan.popular ? 'gradient-primary' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied investors who trust CryptoEarn Pro with their financial future.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Professional Trader",
                content: "CryptoEarn Pro has been a game-changer for my investment portfolio. The daily returns are consistent and the platform is incredibly user-friendly.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Tech Entrepreneur",
                content: "I've been using this platform for 6 months now. The transparency and security measures give me complete confidence in my investments.",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Financial Advisor",
                content: "As a financial advisor, I recommend CryptoEarn Pro to my clients. The risk management and consistent returns are impressive.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="glass border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already earning daily returns with CryptoEarn Pro. 
            Start your journey to financial freedom today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground">CryptoEarn Pro</span>
              </div>
              <p className="text-muted-foreground">
                The most trusted crypto earning platform for passive income generation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/auth/register" className="hover:text-primary">Get Started</Link></li>
                <li><Link href="/auth/login" className="hover:text-primary">Sign In</Link></li>
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="hover:text-primary">Live Chat</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary">Risk Disclosure</Link></li>
                <li><Link href="#" className="hover:text-primary">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CryptoEarn Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
