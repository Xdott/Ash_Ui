import SimpleCreditPurchase from "@/components/simple-credit-purchase"

export default function BuyCreditsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Purchase Credits</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect credit package for your needs. All purchases are secure and credits are activated
            instantly.
          </p>
        </div>

        <SimpleCreditPurchase />
      </div>
    </div>
  )
}
