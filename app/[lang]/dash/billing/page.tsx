"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  source: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface BillingStats {
  totalEarned: number;
  totalSpent: number;
  pendingPayouts: number;
  thisMonthEarned: number;
  thisMonthSpent: number;
}

export default function BillingPage() {
  const { lang } = useParams<{ lang: string }>();
  const { data: session, status, user } = useSupabaseSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats>({
    totalEarned: 0,
    totalSpent: 0,
    pendingPayouts: 0,
    thisMonthEarned: 0,
    thisMonthSpent: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      fetchBillingData();
    } else {
      setLoading(false);
    }
  }, [status]);

  const fetchBillingData = async () => {
    try {
      // TODO: Implement API calls
      // const response = await fetch("/api/billing/stats");
      // const transactionsResponse = await fetch("/api/billing/transactions");

      // Mock data for now
      setStats({
        totalEarned: 5420.50,
        totalSpent: 1234.00,
        pendingPayouts: 320.00,
        thisMonthEarned: 890.00,
        thisMonthSpent: 156.00,
      });

      setTransactions([
        {
          id: "1",
          type: "income",
          amount: 49.99,
          description: "VIP Subscription",
          source: "VIP Content",
          date: new Date().toISOString(),
          status: "completed",
        },
        {
          id: "2",
          type: "income",
          amount: 150.00,
          description: "Private booking",
          source: "Escort Services",
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
        },
        {
          id: "3",
          type: "expense",
          amount: 29.99,
          description: "Event ticket purchase",
          source: "Events",
          date: new Date(Date.now() - 172800000).toISOString(),
          status: "completed",
        },
      ]);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    toastManager.add({
      title: "Authentication Required",
      description: "Please log in to access billing information.",
      type: "warning",
    });
    router.push(`/${lang}`);
    return;
  }

  const incomeTransactions = transactions.filter(t => t.type === "income");
  const expenseTransactions = transactions.filter(t => t.type === "expense");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${lang}/dash`}>
                <Button variant="ghost" size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <CreditCard className="w-8 h-8 text-green-500" />
                  Billing & Payments
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track your earnings, expenses, and payment history
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Earned</div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              ${stats.totalEarned.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              All time earnings
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Total Spent</div>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              ${stats.totalSpent.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              All time expenses
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Pending Payouts</div>
              <DollarSign className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              ${stats.pendingPayouts.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Available for withdrawal
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">Net Balance</div>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${(stats.totalEarned - stats.totalSpent).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total profit
            </div>
          </Card>
        </div>

        {/* This Month Summary */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-green-500/5 to-emerald-500/10 border-green-500/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Month Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Earned This Month</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                ${stats.thisMonthEarned.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Spent This Month</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5" />
                ${stats.thisMonthSpent.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        {/* Transactions */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* All Transactions */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">All Transactions</h2>
            </div>

            {transactions.length === 0 ? (
              <Card className="p-12 text-center">
                <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground">
                  Your transaction history will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "income"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                          }`}>
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.source} • {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          transaction.status === "completed" ? "default" :
                            transaction.status === "pending" ? "secondary" :
                              "destructive"
                        }>
                          {transaction.status}
                        </Badge>
                        <div className={`text-lg font-bold ${transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                          }`}>
                          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Income</h2>
            </div>

            <div className="space-y-3">
              {incomeTransactions.length === 0 ? (
                <Card className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Income Yet</h3>
                  <p className="text-muted-foreground">
                    Your earnings will appear here
                  </p>
                </Card>
              ) : (
                incomeTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.source} • {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Expenses</h2>
            </div>

            <div className="space-y-3">
              {expenseTransactions.length === 0 ? (
                <Card className="p-12 text-center">
                  <TrendingDown className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Expenses Yet</h3>
                  <p className="text-muted-foreground">
                    Your purchases will appear here
                  </p>
                </Card>
              ) : (
                expenseTransactions.map((transaction) => (
                  <Card key={transaction.id} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{transaction.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.source} • {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          -${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Methods */}
        <Card className="mt-8 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </h3>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">
                  CARD
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-muted-foreground">Expires 12/25</div>
                </div>
              </div>
              <Badge>Default</Badge>
            </div>
            <Button variant="outline" className="w-full">
              + Add Payment Method
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/10 border-blue-500/20">
          <h3 className="font-semibold text-lg mb-3">Billing Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Keep track of your earnings across all revenue streams</li>
            <li>✓ Export your transaction history for tax purposes</li>
            <li>✓ Set up automatic payouts to receive your earnings faster</li>
            <li>✓ Monitor your pending payouts regularly</li>
            <li>✓ Keep your payment methods up to date</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
