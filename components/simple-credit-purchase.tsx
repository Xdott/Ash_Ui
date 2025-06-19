"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { CreditCard, Loader2, Check, AlertCircle, Mail, Phone, LinkedinIcon as LinkedIn, Users, Building2, Upload, Plus, Minus, ShoppingCart, Sparkles, BadgeCheck, Shield, Package, Star, ArrowUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface CreditType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  borderColor: string
  pricePerCredit: number // in cents
  minPurchase: number
  maxPurchase: number
  step: number
  popular?: boolean
}

const creditTypes: CreditType[] = [
  {
    id: "contact_upload",
    name: "Contact Upload",
    description: "Bulk upload and process contact lists",
    icon: Upload,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    pricePerCredit: 1, // matches backend
    minPurchase: 500,
    maxPurchase: 50000,
    step: 500,
    popular: true,
  },
  {
    id: "email_validation",
    name: "Email Validation",
    description: "Verify email addresses for deliverability",
    icon: Mail,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    pricePerCredit: 2, // matches backend
    minPurchase: 100,
    maxPurchase: 10000,
    step: 50,
  },
  {
    id: "phone_number_validation",
    name: "Phone Validation",
    description: "Find and verify phone numbers",
    icon: Phone,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    pricePerCredit: 5, // matches backend
    minPurchase: 50,
    maxPurchase: 5000,
    step: 25,
  },
  {
    id: "linkedin_finder",
    name: "LinkedIn Finder",
    description: "Find LinkedIn profiles and professional data",
    icon: LinkedIn,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    pricePerCredit: 5, // updated to match backend
    minPurchase: 25,
    maxPurchase: 2500,
    step: 25,
  },
  {
    id: "contact_finder",
    name: "Contact Finder",
    description: "Complete contact discovery and enrichment",
    icon: Users,
    color: "text-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
    pricePerCredit: 5, // updated to match backend
    minPurchase: 20,
    maxPurchase: 2000,
    step: 20,
  },
  {
    id: "company_finder",
    name: "Company Finder",
    description: "Research company information and details",
    icon: Building2,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    pricePerCredit: 2, // updated to match backend
    minPurchase: 10,
    maxPurchase: 1000,
    step: 10,
  },
  {
    id: "company_people_finder",
    name: "People Finder",
    description: "Find key people at target companies",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    pricePerCredit: 10, // matches backend
    minPurchase: 10,
    maxPurchase: 1000,
    step: 10,
  },
  {
    id: "enrichment",
    name: "Enrichment",
    description: "Enrich contact and company data",
    icon: Sparkles,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    pricePerCredit: 8, // matches backend
    minPurchase: 10,
    maxPurchase: 1000,
    step: 10,
  },
]

interface CartItem {
  creditType: CreditType
  quantity: number
}

interface ContactUploadPlan {
  id: string
  name: string
  contacts: number
  price: number
  popular?: boolean
  savings?: string
  bonusCredits: {
    email_validation: number
    phone_number_validation: number
    linkedin_finder: number
    contact_finder: number
    company_finder: number
    company_people_finder: number
    enrichment: number
  }
}

const contactUploadPlans: ContactUploadPlan[] = [
  {
    id: "starter-5k",
    name: "Starter",
    contacts: 5000,
    price: 29,
    savings: "Perfect for small teams",
    bonusCredits: {
      email_validation: 5000,
      phone_number_validation: 2000,
      linkedin_finder: 1500,
      contact_finder: 1500,
      company_finder: 500,
      company_people_finder: 30,
      enrichment: 200,
    },
  },
  {
    id: "growth-20k",
    name: "Growth",
    contacts: 20000,
    price: 69,
    popular: true,
    savings: "Save 20% + Premium Bonus",
    bonusCredits: {
      email_validation: 10000,
      phone_number_validation: 4800,
      linkedin_finder: 3600,
      contact_finder: 3600,
      company_finder: 1200,
      company_people_finder: 60,
      enrichment: 400,
    },
  },
  {
    id: "pro-100k",
    name: "Professional",
    contacts: 100000,
    price: 149,
    savings: "Save 30% + Maximum Bonus",
    bonusCredits: {
      email_validation: 25000,
      phone_number_validation: 10000,
      linkedin_finder: 7500,
      contact_finder: 7500,
      company_finder: 2500,
      company_people_finder: 120,
      enrichment: 800,
    },
  },
]

export default function IndividualCreditPurchase() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<"plans" | "topups">("plans")
  const [selectedPlan, setSelectedPlan] = useState<ContactUploadPlan | null>(null)
  const [planTopups, setPlanTopups] = useState<Record<string, number>>({})
  const { user, isAuthenticated } = useAuth0()
  const { toast } = useToast()

  // Initialize quantities with minimum values
  useEffect(() => {
    const initialQuantities: Record<string, number> = {}
    const initialPlanTopups: Record<string, number> = {}
    creditTypes.forEach((type) => {
      initialQuantities[type.id] = type.minPurchase
      initialPlanTopups[type.id] = 0
    })
    setQuantities(initialQuantities)
    setPlanTopups(initialPlanTopups)
  }, [])

  const getQuantity = (creditTypeId: string) => {
    const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
    return quantities[creditTypeId] || creditType?.minPurchase || 0
  }

  const setQuantity = (creditTypeId: string, newQuantity: number) => {
    const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
    if (!creditType) return

    const validQuantity = Math.max(creditType.minPurchase, Math.min(newQuantity, creditType.maxPurchase))
    setQuantities((prev) => ({
      ...prev,
      [creditTypeId]: validQuantity,
    }))
  }

  const getPlanTopupQuantity = (creditTypeId: string) => {
    return planTopups[creditTypeId] || 0
  }

  const setPlanTopupQuantity = (creditTypeId: string, newQuantity: number) => {
    const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
    if (!creditType) return

    const validQuantity = Math.max(0, Math.min(newQuantity, creditType.maxPurchase))
    setPlanTopups((prev) => ({
      ...prev,
      [creditTypeId]: validQuantity,
    }))
  }

  const calculatePlanTotal = (plan: ContactUploadPlan) => {
    let total = plan.price * 100 // Convert to cents

    // Add topup costs
    Object.entries(planTopups).forEach(([creditTypeId, quantity]) => {
      const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
      if (creditType && quantity > 0) {
        total += quantity * creditType.pricePerCredit
      }
    })

    return total
  }

  const purchasePlanWithTopups = async (plan: ContactUploadPlan) => {
    if (!isAuthenticated || !user?.email) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase a plan",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Prepare topups data
      const topups = Object.entries(planTopups)
        .filter(([_, quantity]) => quantity > 0)
        .map(([creditTypeId, quantity]) => {
          const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
          return {
            credit_type: creditTypeId,
            quantity,
            price_per_credit: creditType?.pricePerCredit || 0,
          }
        })

      const response = await fetch(`${API_URL}/buy-contact-upload-plan-with-topups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          plan_id: plan.id,
          plan_name: plan.name,
          contacts: plan.contacts,
          base_price: plan.price * 100, // Convert to cents
          bonus_credits: plan.bonusCredits,
          topups: topups,
          total_amount_cents: calculatePlanTotal(plan),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (creditType: CreditType, quantity: number) => {
    const validQuantity = Math.max(creditType.minPurchase, Math.min(quantity, creditType.maxPurchase))

    setCart((prev) => {
      const existing = prev.find((item) => item.creditType.id === creditType.id)
      if (existing) {
        return prev.map((item) => (item.creditType.id === creditType.id ? { ...item, quantity: validQuantity } : item))
      } else {
        return [...prev, { creditType, quantity: validQuantity }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${validQuantity} ${creditType.name} credits added to your cart`,
    })
  }

  const addCustomQuantityToCart = (creditType: CreditType) => {
    const quantity = getQuantity(creditType.id)
    addToCart(creditType, quantity)
  }

  const removeFromCart = (creditTypeId: string) => {
    setCart((prev) => prev.filter((item) => item.creditType.id !== creditTypeId))
  }

  const updateQuantity = (creditTypeId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(creditTypeId)
      return
    }

    setCart((prev) =>
      prev.map((item) => (item.creditType.id === creditTypeId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.quantity * item.creditType.pricePerCredit
    }, 0)
  }

  const getCartTotalCredits = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const purchaseCredits = async () => {
    if (!isAuthenticated || !user?.email) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase credits",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add some credits to your cart first",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/buy-individual-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          cart: cart.map((item) => ({
            credit_type: item.creditType.id,
            quantity: item.quantity,
            price_per_credit: item.creditType.pricePerCredit,
          })),
          total_amount_cents: getCartTotal(),
          total_credits: getCartTotalCredits(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error: any) {
      toast({
        title: "Purchase failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = (creditTypeId: string, amount: number) => {
    const currentQuantity = getQuantity(creditTypeId)
    const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
    if (!creditType) return

    const newQuantity = currentQuantity + amount
    setQuantity(creditTypeId, newQuantity)
  }

  const handlePlanQuickAdd = (creditTypeId: string, amount: number) => {
    const currentQuantity = getPlanTopupQuantity(creditTypeId)
    const creditType = creditTypes.find((ct) => ct.id === creditTypeId)
    if (!creditType) return

    const newQuantity = currentQuantity + amount
    setPlanTopupQuantity(creditTypeId, newQuantity)
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="bg-white shadow-lg border">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to purchase credits</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50">
      {/* Header with animated gradient background */}
      <div className="relative overflow-hidden rounded-2xl mb-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1200')] mix-blend-overlay opacity-20"></div>

        <div className="relative z-10 px-8 py-12 text-center text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Purchase Credits</h1>
          <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
            Choose the perfect credit package for your needs
          </p>
          <p className="text-sm text-white text-opacity-80 mt-2">Logged in as: {user?.email}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "plans"
                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Complete Plans + Bonus Credits
            </div>
          </button>
          <button
            onClick={() => setActiveTab("topups")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "topups"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Individual Top-ups Only
            </div>
          </button>
        </div>
      </div>

      {activeTab === "plans" && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-2 text-purple-600" />
              Complete Plans with Bonus Credits
            </h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Best value with bonus credits included
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {contactUploadPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "ring-2 ring-violet-500 shadow-lg scale-105" : "hover:shadow-md border-violet-200"
                } ${selectedPlan?.id === plan.id ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardContent
                  className={`p-6 ${plan.popular ? "bg-gradient-to-b from-violet-50 to-white" : "bg-white"}`}
                >
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-violet-600">${plan.price}</div>
                      <div className="text-sm text-gray-600 mt-1">{plan.contacts.toLocaleString()} contacts</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${(plan.price / plan.contacts).toFixed(4)} per contact
                      </div>
                    </div>

                    {plan.savings && (
                      <div className="mb-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                          {plan.savings}
                        </span>
                      </div>
                    )}

                    {/* Bonus Credits Display */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-4 w-4 text-amber-600 mr-1" />
                        <span className="text-xs font-semibold text-amber-800">BONUS CREDITS INCLUDED</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-gray-600">Email: {plan.bonusCredits.email_validation}</div>
                        <div className="text-gray-600">Phone: {plan.bonusCredits.phone_number_validation}</div>
                        <div className="text-gray-600">LinkedIn: {plan.bonusCredits.linkedin_finder}</div>
                        <div className="text-gray-600">Contact: {plan.bonusCredits.contact_finder}</div>
                        <div className="text-gray-600">Company: {plan.bonusCredits.company_finder}</div>
                        <div className="text-gray-600">People: {plan.bonusCredits.company_people_finder}</div>
                        <div className="text-gray-600">Enrichment: {plan.bonusCredits.enrichment}</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 text-left">
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">Bulk contact processing</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">All bonus credits included</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-600">Add extra credits below</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                      variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                      className="w-full mb-3"
                    >
                      {selectedPlan?.id === plan.id ? "Selected - Customize Below" : "Select Plan"}
                    </Button>

                    {selectedPlan?.id !== plan.id && (
                      <Button
                        onClick={() => purchasePlanWithTopups(plan)}
                        disabled={loading}
                        className={`w-full ${
                          plan.popular
                            ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        } text-white shadow-md`}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          "Buy Now"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Plan Customization Section */}
          {selectedPlan && (
            <Card className="mb-8 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="flex items-center text-xl">
                  <Plus className="h-5 w-5 mr-2 text-purple-600" />
                  Customize Your {selectedPlan.name} Plan
                  <Badge className="ml-2 bg-purple-600">Optional Add-ons</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {creditTypes.map((creditType) => {
                    const IconComponent = creditType.icon
                    const quantity = getPlanTopupQuantity(creditType.id)
                    const bonusAmount =
                      selectedPlan.bonusCredits[creditType.id as keyof typeof selectedPlan.bonusCredits] || 0

                    return (
                      <Card key={creditType.id} className={`${creditType.borderColor} ${creditType.bgColor}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 bg-white shadow-sm`}
                            >
                              <IconComponent className={`h-4 w-4 ${creditType.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-900">{creditType.name}</h4>
                              <p className="text-xs text-gray-600">{bonusAmount} included + add more</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Add extra:</span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPlanTopupQuantity(creditType.id, Math.max(0, quantity - creditType.step))
                                  }
                                  disabled={quantity <= 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <div className="relative">
                                  <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                      const newValue = Number.parseInt(e.target.value) || 0
                                      setPlanTopupQuantity(creditType.id, newValue)
                                    }}
                                    min={0}
                                    max={creditType.maxPurchase}
                                    step={creditType.step}
                                    className="w-20 text-center border border-gray-300 rounded px-1 py-0.5 text-xs pr-6"
                                  />
                                  <div className="absolute right-0 top-0 h-full flex flex-col">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handlePlanQuickAdd(creditType.id, creditType.step)}
                                      className="h-3 w-6 p-0 flex items-center justify-center"
                                    >
                                      <ArrowUp className="h-2 w-2" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handlePlanQuickAdd(creditType.id, -creditType.step)}
                                      disabled={quantity <= 0}
                                      className="h-3 w-6 p-0 flex items-center justify-center"
                                    >
                                      <Minus className="h-2 w-2" />
                                    </Button>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setPlanTopupQuantity(
                                      creditType.id,
                                      Math.min(quantity + creditType.step, creditType.maxPurchase),
                                    )
                                  }
                                  disabled={quantity >= creditType.maxPurchase}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              {quantity > 0 && (
                                <div className="text-xs text-gray-600">
                                  +${((quantity * creditType.pricePerCredit) / 100).toFixed(2)}
                                </div>
                              )}
                              <div className="flex space-x-1 ml-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlanQuickAdd(creditType.id, creditType.step * 5)}
                                  className="h-5 text-xs py-0 px-1.5"
                                >
                                  +{creditType.step * 5}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlanQuickAdd(creditType.id, creditType.step * 10)}
                                  className="h-5 text-xs py-0 px-1.5"
                                >
                                  +{creditType.step * 10}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-lg">
                      Total: ${(calculatePlanTotal(selectedPlan) / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Base plan: ${selectedPlan.price} + Add-ons: $
                      {((calculatePlanTotal(selectedPlan) - selectedPlan.price * 100) / 100).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    onClick={() => purchasePlanWithTopups(selectedPlan)}
                    disabled={loading}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Purchase Customized Plan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "topups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Types */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Plus className="h-6 w-6 mr-2 text-orange-600" />
                Individual Credit Top-ups
              </h2>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Pay only for what you need
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creditTypes.map((creditType) => {
                const IconComponent = creditType.icon
                const cartItem = cart.find((item) => item.creditType.id === creditType.id)
                const quantity = getQuantity(creditType.id)

                return (
                  <Card
                    key={creditType.id}
                    className={`transition-all duration-300 hover:shadow-lg ${creditType.borderColor} ${
                      creditType.popular ? "ring-2 ring-purple-500" : ""
                    }`}
                  >
                    {creditType.popular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                          Popular
                        </span>
                      </div>
                    )}

                    <CardContent className={`p-6 ${creditType.bgColor}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${creditType.color} bg-white shadow-sm`}
                          >
                            <IconComponent className={`h-5 w-5 ${creditType.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{creditType.name}</h3>
                            <p className="text-xs text-gray-600">{creditType.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Price per credit:</span>
                          <span className="text-lg font-bold text-gray-900">
                            ${(creditType.pricePerCredit / 100).toFixed(3)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {creditType.minPurchase.toLocaleString()} • Max:{" "}
                          {creditType.maxPurchase.toLocaleString()}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Quantity:</label>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setQuantity(creditType.id, Math.max(quantity - creditType.step, creditType.minPurchase))
                              }
                              disabled={quantity <= creditType.minPurchase}
                              className="h-8 w-8 p-0 flex items-center justify-center"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="relative">
                              <input
                                type="number"
                                value={quantity}
                                onChange={(e) => {
                                  const newValue = Number.parseInt(e.target.value) || creditType.minPurchase
                                  setQuantity(creditType.id, newValue)
                                }}
                                min={creditType.minPurchase}
                                max={creditType.maxPurchase}
                                step={creditType.step}
                                className="w-24 text-center border border-gray-300 rounded px-2 py-1 text-sm pr-6"
                              />
                              <div className="absolute right-0 top-0 h-full flex flex-col">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleQuickAdd(creditType.id, creditType.step)}
                                  className="h-4 w-6 p-0 flex items-center justify-center"
                                >
                                  <ArrowUp className="h-2 w-2" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleQuickAdd(creditType.id, -creditType.step)}
                                  disabled={quantity <= creditType.minPurchase}
                                  className="h-4 w-6 p-0 flex items-center justify-center"
                                >
                                  <Minus className="h-2 w-2" />
                                </Button>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setQuantity(creditType.id, Math.min(quantity + creditType.step, creditType.maxPurchase))
                              }
                              disabled={quantity >= creditType.maxPurchase}
                              className="h-8 w-8 p-0 flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Total:{" "}
                            <span className="font-semibold">
                              ${((quantity * creditType.pricePerCredit) / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAdd(creditType.id, creditType.step * 5)}
                              className="h-6 text-xs py-0 px-2"
                            >
                              +{creditType.step * 5}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuickAdd(creditType.id, creditType.step * 10)}
                              className="h-6 text-xs py-0 px-2"
                            >
                              +{creditType.step * 10}
                            </Button>
                          </div>
                        </div>

                        <Button
                          onClick={() => addCustomQuantityToCart(creditType)}
                          className={`w-full ${
                            cartItem
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              : "bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800"
                          } text-white shadow-sm`}
                        >
                          {cartItem ? (
                            <div className="flex items-center justify-center">
                              <BadgeCheck className="h-4 w-4 mr-2" />
                              In Cart - Update
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </div>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-lg border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 pb-4">
                <CardTitle className="flex items-center text-lg">
                  <ShoppingCart className="h-5 w-5 mr-2 text-purple-600" />
                  Your Cart
                  {cart.length > 0 && <Badge className="ml-2 bg-purple-600">{cart.length}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-gray-500 mb-2">Your cart is empty</div>
                    <div className="text-sm text-gray-400">Add credits to get started</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const IconComponent = item.creditType.icon
                      return (
                        <div
                          key={item.creditType.id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${item.creditType.bgColor}`}
                            >
                              <IconComponent className={`h-4 w-4 ${item.creditType.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900">{item.creditType.name}</div>
                              <div className="text-xs text-gray-500">{item.quantity.toLocaleString()} credits</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-900">
                              ${((item.quantity * item.creditType.pricePerCredit) / 100).toFixed(2)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.creditType.id)}
                              className="text-red-600 hover:text-red-700 text-xs p-0 h-auto"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )
                    })}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Total Credits:</span>
                        <span className="font-semibold text-gray-900">{getCartTotalCredits().toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-medium text-gray-900">Total Cost:</span>
                        <span className="text-xl font-bold text-violet-600">${(getCartTotal() / 100).toFixed(2)}</span>
                      </div>

                      <Button
                        onClick={purchaseCredits}
                        disabled={loading || cart.length === 0}
                        className="w-full py-6 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white shadow-md"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Purchase Credits
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security badges */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Shield className="h-3 w-3 text-green-500 mr-1" />
                      Secure payment with Stripe
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                      Credits never expire
                    </div>
                    <div className="flex items-center">
                      <Check className="h-3 w-3 text-green-500 mr-1" />
                      Instant activation
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}