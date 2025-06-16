"use client"

import Link from "next/link"
import { Phone, User, Building2, Mail, BarChart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="h-10 w-10 relative mr-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Xdott CI</h1>
            <p className="text-xs text-gray-500">Contact Intelligence</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-1">
          <Link href="/">
            <Button variant="ghost" className="flex items-center hover:bg-gray-100">
              <User className="h-4 w-4 mr-2" /> Contact Finder
            </Button>
          </Link>
          <Link href="/company-finder">
            <Button variant="ghost" className="flex items-center hover:bg-gray-100">
              <Building2 className="h-4 w-4 mr-2" /> Company Finder
            </Button>
          </Link>
          <Link href="/email-validator">
            <Button variant="ghost" className="flex items-center hover:bg-gray-100">
              <Mail className="h-4 w-4 mr-2" /> Email Validator
            </Button>
          </Link>
          <Link href="/phone-validator">
            <Button variant="ghost" className="flex items-center hover:bg-gray-100">
              <Phone className="h-4 w-4 mr-2" /> Phone Validator
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="ghost" className="flex items-center hover:bg-gray-100">
              <BarChart className="h-4 w-4 mr-2" /> Reports
            </Button>
          </Link>
        </div>

        <div className="flex items-center">
          <div className="hidden md:block mr-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Demo User</p>
              <p className="text-xs text-gray-500">Welcome back</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="hidden md:block">
            Login
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
