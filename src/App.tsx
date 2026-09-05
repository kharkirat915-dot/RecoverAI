/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  TrendingUp,
  CreditCard,
  Send,
  MessageSquare,
  ShieldAlert,
  Search,
  Filter,
  Sliders,
  Play,
  Copy,
  Check,
  Zap,
  Bot,
  X,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  BarChart3,
  Percent,
  CheckCircle,
  Layers,
  HelpCircle,
  Bell,
  Wallet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

// ==========================================
// TYPES
// ==========================================

export type FailureReason =
  | 'insufficient_funds'
  | 'card_expired'
  | 'bank_server_timeout'
  | 'risk_declined'
  | 'otp_timeout'
  | 'network_error';

export type RecoveryStatus = 'Pending' | 'Recovering' | 'Recovered' | 'Lost';

export interface Transaction {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  failureReason: FailureReason;
  aiAction: string;
  status: RecoveryStatus;
  timestamp: string;
  recoveryMessage: string;
  confidenceScore: number;
  paymentMethod: string;
  gatewayErrorCode: string;
  aiReasoning: string;
  retryAttempts: number;
  actionChannel: 'whatsapp' | 'sms' | 'auto_retry' | 'email' | 'manual';
  optimalTimeWindow: string;
  customerTier: 'VIP' | 'Regular' | 'New';
  recoveryChannelUsed?: string;
  recoveredAt?: string;
}

// ==========================================
// INITIAL MOCK DATA
// ==========================================

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'pay_Nz82Kl90aB',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma92@gmail.com',
    customerPhone: '+91 98201 44102',
    amount: 4299,
    failureReason: 'bank_server_timeout',
    aiAction: 'Smart Delayed Retry (15 mins)',
    status: 'Recovered',
    timestamp: '12 mins ago',
    confidenceScore: 98,
    paymentMethod: 'HDFC Debit Card ••4102',
    gatewayErrorCode: 'GATEWAY_ERROR_ISSUER_TIMEOUT',
    aiReasoning: 'HDFC gateway telemetry detected temporary 3DS API throttling. Held immediate customer retries to avoid account lock. Autonomous server retry dispatched 14 mins later and settled successfully.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: 'Within 15 mins (post-downtime)',
    customerTier: 'VIP',
    recoveryChannelUsed: 'Autonomous Silent Retry',
    recoveredAt: 'Just now',
    recoveryMessage: 'Your transaction of ₹4,299 was seamlessly recovered via HDFC instant retry.'
  },
  {
    id: 'pay_Ox73Jm11cK',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.verma@outlook.com',
    customerPhone: '+91 98112 55901',
    amount: 1899,
    failureReason: 'insufficient_funds',
    aiAction: 'Incentivized Retry (5% off) + WhatsApp Link',
    status: 'Recovering',
    timestamp: '28 mins ago',
    confidenceScore: 94,
    paymentMethod: 'Google Pay UPI (rahul@okhdfcbank)',
    gatewayErrorCode: 'INSUFFICIENT_FUNDS_UPI_DECLINE',
    aiReasoning: 'Customer balance low for ₹1,899 ticket. Autonomous agent drafted a WhatsApp 1-tap payment link with an instant ₹95 discount code (RECOVER5) offering fallback to Paytm/PhonePe UPI or credit card.',
    retryAttempts: 1,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Immediate via WhatsApp',
    customerTier: 'Regular',
    recoveryMessage: 'Hi Rahul, we noticed your payment of ₹1,899 encountered a bank balance glitch. Here is an exclusive ₹95 discount code applied: https://rzp.io/i/rAI_8992. Click to complete in 1-tap via any UPI app!'
  },
  {
    id: 'pay_Kq94Np88vX',
    customerName: 'Ananya Iyer',
    customerEmail: 'ananya.iyer@gmail.com',
    customerPhone: '+91 97401 22891',
    amount: 12450,
    failureReason: 'card_expired',
    aiAction: 'Update Payment Method Portal Link',
    status: 'Recovered',
    timestamp: '45 mins ago',
    confidenceScore: 96,
    paymentMethod: 'ICICI Coral Credit Card ••8902',
    gatewayErrorCode: 'EXPIRED_CARD_SUBMITTED',
    aiReasoning: 'Card validity expired (08/26). Direct retries would fail 100%. Nabbit sent an authenticated card updating link via SMS & Email. Customer entered fresh RuPay card and completed payment.',
    retryAttempts: 1,
    actionChannel: 'sms',
    optimalTimeWindow: '10:00 AM - 1:00 PM',
    customerTier: 'VIP',
    recoveryChannelUsed: 'SMS Tokenized Link',
    recoveredAt: '18 mins ago',
    recoveryMessage: 'Hi Ananya, your ICICI card validity ended. Complete your ₹12,450 booking securely by updating your payment method here: https://rzp.io/i/card_upd_772'
  },
  {
    id: 'pay_Lt19Wq44zP',
    customerName: 'Vikram Patel',
    customerEmail: 'vikram.patel@ahmedabad.biz',
    customerPhone: '+91 99250 88123',
    amount: 8750,
    failureReason: 'otp_timeout',
    aiAction: 'WhatsApp 1-Click UPI Intent Link',
    status: 'Pending',
    timestamp: '1 hour ago',
    confidenceScore: 91,
    paymentMethod: 'SBI Netbanking',
    gatewayErrorCode: 'ACS_3DS_OTP_EXPIRED',
    aiReasoning: 'Customer abandoned payment during SBI OTP challenge after 180s. High intent detected (stayed on checkout). Dispatching WhatsApp interactive link to pay instantly without OTP via PhonePe UPI intent.',
    retryAttempts: 0,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Evenings (6:00 PM - 8:00 PM)',
    customerTier: 'Regular',
    recoveryMessage: 'Hi Vikram, did your SBI OTP time out? Skip the OTP hassle and finish your order of ₹8,750 using instant UPI: https://rzp.io/i/upi_fast_419'
  },
  {
    id: 'pay_Mr31Yp66sD',
    customerName: 'Rajesh Mehta',
    customerEmail: 'rajesh.m@mehtatraders.in',
    customerPhone: '+91 98450 11990',
    amount: 24999,
    failureReason: 'risk_declined',
    aiAction: 'Escalate to VIP Merchant Ops',
    status: 'Lost',
    timestamp: '2 hours ago',
    confidenceScore: 88,
    paymentMethod: 'Foreign Visa Signature ••0019',
    gatewayErrorCode: 'RISK_THIRD_WATCH_SCORE_HIGH',
    aiReasoning: 'Razorpay Thirdwatch AI flagged high velocity risk score (89/100) with foreign IP / domestic card mismatch. Automated retry aborted to prevent chargeback penalty. Routed to merchant fraud ops for KYC verification.',
    retryAttempts: 0,
    actionChannel: 'manual',
    optimalTimeWindow: 'Manual agent call',
    customerTier: 'New',
    recoveryMessage: 'Order flagged by fraud defense. Merchant manual verification ticket #TKT-9912 created.'
  },
  {
    id: 'pay_Jp48Vm22wE',
    customerName: 'Neha Gupta',
    customerEmail: 'neha.gupta.design@gmail.com',
    customerPhone: '+91 98103 44921',
    amount: 3200,
    failureReason: 'network_error',
    aiAction: 'Silent Background Retry (2m)',
    status: 'Recovered',
    timestamp: '2 hours ago',
    confidenceScore: 99,
    paymentMethod: 'PhonePe UPI (neha@ybl)',
    gatewayErrorCode: 'CLIENT_SOCKET_RESET_DURING_HANDSHAKE',
    aiReasoning: 'Client connection terminated prematurely before NPCI 2-factor acknowledgment. Idempotency key verified. Nabbit executed silent server-to-server callback retry without disturbing the user.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: 'Immediate',
    customerTier: 'Regular',
    recoveryChannelUsed: 'Idempotent NPCI Retry',
    recoveredAt: '1 hour ago',
    recoveryMessage: 'Transaction recovered automatically without friction.'
  },
  {
    id: 'pay_Bx55Tn88qK',
    customerName: 'Rohan Nair',
    customerEmail: 'rohan.nair.dev@gmail.com',
    customerPhone: '+91 97411 90872',
    amount: 1499,
    failureReason: 'bank_server_timeout',
    aiAction: 'Smart Delayed Retry (30 mins)',
    status: 'Recovering',
    timestamp: '3 hours ago',
    confidenceScore: 93,
    paymentMethod: 'Axis Bank Netbanking',
    gatewayErrorCode: 'ISSUER_UNAVAILABLE_CODE_91',
    aiReasoning: 'Axis Bank core banking infrastructure reported degraded throughput. Smart retry scheduler placed transaction in low-concurrency queue. Second retry scheduled for T+30 min.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: 'After 30 mins',
    customerTier: 'Regular',
    recoveryMessage: 'Auto-retry scheduled with Axis Bank gateway endpoint.'
  },
  {
    id: 'pay_Hs66Wz11yM',
    customerName: 'Sneha Kulkarni',
    customerEmail: 'sneha.k@pune-tech.org',
    customerPhone: '+91 98220 33419',
    amount: 5499,
    failureReason: 'insufficient_funds',
    aiAction: 'Incentivized Retry (₹250 off) + WhatsApp Link',
    status: 'Recovered',
    timestamp: '4 hours ago',
    confidenceScore: 95,
    paymentMethod: 'Kotak Debit Card ••1928',
    gatewayErrorCode: 'GATEWAY_ERROR_INSUFFICIENT_BALANCE',
    aiReasoning: 'Repeat buyer cart failure. AI dispatched personalized WhatsApp message with instant ₹250 wallet credit nudge. Customer swapped payment method to UPI Credit Line and converted within 8 minutes.',
    retryAttempts: 1,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Immediate',
    customerTier: 'VIP',
    recoveryChannelUsed: 'WhatsApp Interactive Checkout',
    recoveredAt: '3 hours ago',
    recoveryMessage: 'Hey Sneha! Your ₹5,499 purchase was saved with an exclusive ₹250 loyalty credit: https://rzp.io/i/rew_551'
  },
  {
    id: 'pay_Pq77Vb44xR',
    customerName: 'Aditya Roy',
    customerEmail: 'aditya.roy@kolkata-arts.in',
    customerPhone: '+91 98300 77112',
    amount: 699,
    failureReason: 'otp_timeout',
    aiAction: 'WhatsApp 1-Click UPI Intent Link',
    status: 'Recovering',
    timestamp: '5 hours ago',
    confidenceScore: 92,
    paymentMethod: 'Paytm UPI (aditya@paytm)',
    gatewayErrorCode: 'USER_ABANDONED_3DS',
    aiReasoning: 'Micro-ticket ₹699 failure due to SMS OTP delay. WhatsApp link sent with dynamic QR code & 1-tap intent.',
    retryAttempts: 1,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Immediate',
    customerTier: 'New',
    recoveryMessage: 'Pay ₹699 in 1 tap on Paytm UPI without waiting for SMS OTP: https://rzp.io/i/quick_699'
  },
  {
    id: 'pay_Kk88Mm99qL',
    customerName: 'Pooja Joshi',
    customerEmail: 'pooja.joshi@mumbai.co',
    customerPhone: '+91 98205 66781',
    amount: 7200,
    failureReason: 'card_expired',
    aiAction: 'Update Payment Method Portal Link',
    status: 'Pending',
    timestamp: '6 hours ago',
    confidenceScore: 89,
    paymentMethod: 'Standard Chartered CC ••5501',
    gatewayErrorCode: 'CARD_EXPIRED_OR_INVALID',
    aiReasoning: 'Expired card on recurring merchant tier. Tokenization portal link staged. Pending merchant automated rule dispatch for 6:00 PM evening batch.',
    retryAttempts: 0,
    actionChannel: 'email',
    optimalTimeWindow: '6:00 PM - 8:00 PM',
    customerTier: 'Regular',
    recoveryMessage: 'Action pending: Scheduled email & SMS token update link.'
  },
  {
    id: 'pay_Ww99Qq22aB',
    customerName: 'Karan Malhotra',
    customerEmail: 'karan.malhotra@delhi.biz',
    customerPhone: '+91 98110 88234',
    amount: 18500,
    failureReason: 'bank_server_timeout',
    aiAction: 'Smart Delayed Retry (15 mins)',
    status: 'Recovered',
    timestamp: '7 hours ago',
    confidenceScore: 97,
    paymentMethod: 'SBI Corporate Netbanking',
    gatewayErrorCode: 'GATEWAY_ERROR_NETWORK_TIMEOUT',
    aiReasoning: 'SBI host timed out during peak morning treasury clearing. Nabbit delayed retry by 18 minutes. Succeeded on first scheduled retry.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: '18 mins later',
    customerTier: 'VIP',
    recoveryChannelUsed: 'Autonomous Silent Retry',
    recoveredAt: '6 hours ago',
    recoveryMessage: 'Corporate payment of ₹18,500 successfully recovered.'
  },
  {
    id: 'pay_Dd11Ff33gH',
    customerName: 'Meera Nambiar',
    customerEmail: 'meera.n@kerala-ayur.org',
    customerPhone: '+91 94470 12345',
    amount: 2899,
    failureReason: 'insufficient_funds',
    aiAction: 'Incentivized Retry (5% off) + WhatsApp Link',
    status: 'Recovered',
    timestamp: '8 hours ago',
    confidenceScore: 94,
    paymentMethod: 'Canara Bank Debit Card ••7712',
    gatewayErrorCode: 'INSUFFICIENT_FUNDS',
    aiReasoning: 'Balance insufficiency nudge sent with ₹145 off coupon. Converted via GPay within 25 minutes of message receipt.',
    retryAttempts: 1,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Immediate',
    customerTier: 'Regular',
    recoveryChannelUsed: 'WhatsApp Discount Nudge',
    recoveredAt: '7 hours ago',
    recoveryMessage: 'Payment recovered with ₹145 coupon.'
  },
  {
    id: 'pay_Zz22Xx44cV',
    customerName: 'Tarun Saxena',
    customerEmail: 'tarun.saxena@lucknow.in',
    customerPhone: '+91 94150 99881',
    amount: 9450,
    failureReason: 'risk_declined',
    aiAction: 'Escalate to VIP Merchant Ops',
    status: 'Lost',
    timestamp: '10 hours ago',
    confidenceScore: 86,
    paymentMethod: 'Prepaid Virtual Card ••9011',
    gatewayErrorCode: 'PREPAID_CARD_RESTRICTED',
    aiReasoning: 'Disposable virtual card blocked by merchant risk filter. Merchant support contacted customer, but customer chose to cancel.',
    retryAttempts: 0,
    actionChannel: 'manual',
    optimalTimeWindow: 'Manual Support',
    customerTier: 'New',
    recoveryMessage: 'Customer opted out after manual follow-up.'
  },
  {
    id: 'pay_Vv33Bb55nN',
    customerName: 'Deepa Krishnan',
    customerEmail: 'deepa.k@chennai-design.com',
    customerPhone: '+91 98400 44556',
    amount: 3890,
    failureReason: 'network_error',
    aiAction: 'Silent Background Retry (2m)',
    status: 'Recovered',
    timestamp: '11 hours ago',
    confidenceScore: 98,
    paymentMethod: 'Axis Debit Card ••3319',
    gatewayErrorCode: 'TCP_CONNECTION_RESET',
    aiReasoning: 'Mobile data dropped during 3DS redirect. Background retry succeeded immediately once connection stabilized.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: 'Immediate',
    customerTier: 'VIP',
    recoveryChannelUsed: 'Autonomous Silent Retry',
    recoveredAt: '10 hours ago',
    recoveryMessage: 'Transaction recovered automatically.'
  },
  {
    id: 'pay_Qq44Ww66eE',
    customerName: 'Sanjay Dutt Rao',
    customerEmail: 'sanjay.rao@bangalore-tech.io',
    customerPhone: '+91 99001 22334',
    amount: 6200,
    failureReason: 'otp_timeout',
    aiAction: 'WhatsApp 1-Click UPI Intent Link',
    status: 'Lost',
    timestamp: '14 hours ago',
    confidenceScore: 82,
    paymentMethod: 'IndusInd Netbanking',
    gatewayErrorCode: 'OTP_EXPIRED_NO_RESPONSE',
    aiReasoning: 'Customer abandoned checkout; 2 WhatsApp reminders sent with no click activity within 12-hour limit. Marked as lost per policy.',
    retryAttempts: 2,
    actionChannel: 'whatsapp',
    optimalTimeWindow: 'Within 2 hours',
    customerTier: 'New',
    recoveryMessage: 'Recovery window timed out after 12 hours.'
  },
  {
    id: 'pay_Mm55Nn77bB',
    customerName: 'Divya Chawla',
    customerEmail: 'divya.chawla@gurgaon.co',
    customerPhone: '+91 98180 55667',
    amount: 15400,
    failureReason: 'bank_server_timeout',
    aiAction: 'Smart Delayed Retry (15 mins)',
    status: 'Recovered',
    timestamp: '18 hours ago',
    confidenceScore: 97,
    paymentMethod: 'HDFC Regalia Credit Card ••9901',
    gatewayErrorCode: 'ISSUER_DOWNTIME_SPIKE',
    aiReasoning: 'HDFC payment node glitch. Autonomous retry delayed by 20 minutes safely recovered the high-value order.',
    retryAttempts: 1,
    actionChannel: 'auto_retry',
    optimalTimeWindow: '20 mins delay',
    customerTier: 'VIP',
    recoveryChannelUsed: 'Autonomous Silent Retry',
    recoveredAt: '17 hours ago',
    recoveryMessage: 'Recovered ₹15,400 via autonomous delayed queue.'
  }
];

// 14-Day Performance Data for Chart
const FOURTEEN_DAY_CHART_DATA = [
  { day: 'Feb 21', recovered: 42300, lost: 12400, totalAtRisk: 54700, rate: 77.3 },
  { day: 'Feb 22', recovered: 48900, lost: 15200, totalAtRisk: 64100, rate: 76.2 },
  { day: 'Feb 23', recovered: 39500, lost: 8900, totalAtRisk: 48400, rate: 81.6 },
  { day: 'Feb 24', recovered: 56100, lost: 14800, totalAtRisk: 70900, rate: 79.1 },
  { day: 'Feb 25', recovered: 61400, lost: 11200, totalAtRisk: 72600, rate: 84.5 },
  { day: 'Feb 26', recovered: 52800, lost: 16400, totalAtRisk: 69200, rate: 76.3 },
  { day: 'Feb 27', recovered: 47900, lost: 9800, totalAtRisk: 57700, rate: 83.0 },
  { day: 'Feb 28', recovered: 68400, lost: 13500, totalAtRisk: 81900, rate: 83.5 },
  { day: 'Mar 01', recovered: 74200, lost: 14900, totalAtRisk: 89100, rate: 83.2 },
  { day: 'Mar 02', recovered: 63800, lost: 17200, totalAtRisk: 81000, rate: 78.7 },
  { day: 'Mar 03', recovered: 81500, lost: 12900, totalAtRisk: 94400, rate: 86.3 },
  { day: 'Mar 04', recovered: 79300, lost: 11400, totalAtRisk: 90700, rate: 87.4 },
  { day: 'Mar 05', recovered: 88400, lost: 13800, totalAtRisk: 102200, rate: 86.4 },
  { day: 'Today', recovered: 64500, lost: 8900, totalAtRisk: 73400, rate: 87.8 }
];

// Helper to format currency in INR
const formatINR = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// ==========================================
// MAIN NABBIT APPLICATION
// ==========================================

export default function App() {
  // Navigation tabs: 'dashboard' | 'simulator' | 'rules' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'rules' | 'analytics'>('dashboard');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Recovering' | 'Recovered' | 'Lost'>('All');
  const [reasonFilter, setReasonFilter] = useState<string>('All');

  // Chart View Style
  const [chartMode, setChartMode] = useState<'bar' | 'area'>('bar');

  // Settings State
  const [settings, setSettings] = useState({
    autoRetryHours: '2 hours',
    autoRetryEnabled: true,
    discountAbove500: true,
    discountPercent: 5,
    discountThreshold: 500,
    escalateAfterRetries: 2,
    escalateEnabled: true,
    whatsappChannelEnabled: true,
    smsFallbackEnabled: true,
    safeHoursOnly: true,
    safeHoursStart: '09:00',
    safeHoursEnd: '21:00'
  });

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  // Simulator Form State
  const [simCustomer, setSimCustomer] = useState('Arjun Kapoor');
  const [simAmount, setSimAmount] = useState<number>(3499);
  const [simReason, setSimReason] = useState<FailureReason>('insufficient_funds');
  const [simMethod, setSimMethod] = useState('HDFC Bank Debit Card');
  const [simTier, setSimTier] = useState<'VIP' | 'Regular' | 'New'>('Regular');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simError, setSimError] = useState<string | null>(null);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const [simResult, setSimResult] = useState<{
    action: string;
    confidence: number;
    whyThisWasSelected: {
      failurePattern: string;
      recoveryLikelihood: string;
      costBenefit: string;
    };
    constraintChecks: Array<{
      constraint: string;
      status: 'Passed' | 'Failed';
    }>;
    message: string;
    escalate: boolean;
    channel: 'whatsapp' | 'auto_retry' | 'sms' | 'manual';
    errorCode: string;
    isLiveAi?: boolean;
  } | null>(null);

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalFailed = transactions.reduce((acc, t) => acc + t.amount, 0);
    const recoveredTxs = transactions.filter((t) => t.status === 'Recovered');
    const totalRecovered = recoveredTxs.reduce((acc, t) => acc + t.amount, 0);
    const recoveringTxs = transactions.filter((t) => t.status === 'Recovering');
    const totalRecovering = recoveringTxs.reduce((acc, t) => acc + t.amount, 0);
    const recoveryRate = transactions.length > 0 ? Math.round((recoveredTxs.length / transactions.length) * 100) : 0;
    const activeAttempts = transactions.filter((t) => t.status === 'Recovering' || t.status === 'Pending').length;

    return {
      revenueAtRisk: totalFailed,
      recoveredThisWeek: totalRecovered,
      recoveryRate,
      activeAttempts,
      totalRecovering
    };
  }, [transactions]);

  // Filtered transactions for the table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' ? true : tx.status === statusFilter;
      const matchesReason = reasonFilter === 'All' ? true : tx.failureReason === reasonFilter;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [transactions, searchQuery, statusFilter, reasonFilter]);

  // Action: Trigger instant recovery on a transaction
  const handleTriggerRecovery = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            status: 'Recovered',
            recoveredAt: 'Just now',
            recoveryChannelUsed: t.aiAction.includes('WhatsApp')
              ? 'WhatsApp Interactive Link'
              : t.aiAction.includes('Retry')
              ? 'Autonomous Delayed Retry'
              : 'SMS Token Link',
            retryAttempts: t.retryAttempts + 1
          };
        }
        return t;
      })
    );
    if (selectedTx && selectedTx.id === txId) {
      setSelectedTx((prev) =>
        prev
          ? {
              ...prev,
              status: 'Recovered',
              recoveredAt: 'Just now',
              retryAttempts: prev.retryAttempts + 1
            }
          : null
      );
    }
    showToast(`Recovery successfully triggered! Transaction ${txId} marked as Recovered.`);
  };

  // Action: Simulate new incoming failure (demo excitement)
  const handleQuickAddFailure = () => {
    const randomCustomers = [
      { name: 'Kavita Chidambaram', method: 'SBI UPI (kavita@oksbi)', amount: 2490, tier: 'VIP' as const },
      { name: 'Amitabh Sen', method: 'ICICI Sapphiro CC ••8912', amount: 9800, tier: 'Regular' as const },
      { name: 'Pooja Bhatia', method: 'Axis Netbanking', amount: 1599, tier: 'New' as const },
      { name: 'Gautam Menon', method: 'PhonePe UPI', amount: 3750, tier: 'Regular' as const }
    ];
    const picked = randomCustomers[Math.floor(Math.random() * randomCustomers.length)];
    const failureTypes: FailureReason[] = ['insufficient_funds', 'bank_server_timeout', 'otp_timeout', 'network_error'];
    const chosenReason = failureTypes[Math.floor(Math.random() * failureTypes.length)];

    let action = 'Smart Delayed Retry (15 mins)';
    let reasoning = 'Autonomous retry scheduled after gateway stabilization.';
    let message = 'Your payment was saved.';
    let channel: 'auto_retry' | 'whatsapp' = 'auto_retry';

    if (chosenReason === 'insufficient_funds') {
      action = 'Incentivized Retry (5% off) + WhatsApp Link';
      reasoning = 'Balance insufficiency detected. 5% discount link dispatched via WhatsApp.';
      message = `Hi ${picked.name}, finish your payment of ${formatINR(picked.amount)} with 5% off: https://rzp.io/i/rec_${Math.floor(Math.random() * 9000 + 1000)}`;
      channel = 'whatsapp';
    } else if (chosenReason === 'otp_timeout') {
      action = 'WhatsApp 1-Click UPI Intent Link';
      reasoning = 'Customer abandoned on OTP page. WhatsApp link sent to pay via UPI 1-tap.';
      message = `Hi ${picked.name}, skip OTP delay and pay ${formatINR(picked.amount)} in 1-tap: https://rzp.io/i/upi_${Math.floor(Math.random() * 9000 + 1000)}`;
      channel = 'whatsapp';
    }

    const newTx: Transaction = {
      id: `pay_Sim${Math.floor(Math.random() * 89999 + 10000)}`,
      customerName: picked.name,
      customerEmail: `${picked.name.toLowerCase().replace(' ', '.')}@example.in`,
      customerPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      amount: picked.amount,
      failureReason: chosenReason,
      aiAction: action,
      status: 'Recovering',
      timestamp: 'Just now',
      confidenceScore: Math.floor(Math.random() * 6) + 93,
      paymentMethod: picked.method,
      gatewayErrorCode: chosenReason.toUpperCase() + '_ERROR',
      aiReasoning: reasoning,
      retryAttempts: 1,
      actionChannel: channel,
      optimalTimeWindow: 'Immediate',
      customerTier: picked.tier,
      recoveryMessage: message
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Incoming failed payment captured! Nabbit initiated ${action}.`);
  };

  // Run Simulator Engine using live Gemini API
  const handleRunSimulator = async () => {
    setIsSimulating(true);
    setSimStep(1);
    setSimResult(null);
    setSimError(null);

    const stepTimer1 = setTimeout(() => setSimStep(2), 500);
    const stepTimer2 = setTimeout(() => setSimStep(3), 1000);

    try {
      const response = await fetch('/api/recover/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: simAmount,
          failureReason: simReason,
          customerName: simCustomer,
          paymentMethod: simMethod,
          customerTier: simTier,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.message || 'AI analysis temporarily unavailable');
      }

      const data = await response.json();

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // Determine channel from action text
      const actionText = (data.recommendedAction || '').toLowerCase();
      let channel: 'whatsapp' | 'auto_retry' | 'sms' | 'manual' = 'whatsapp';
      if (data.escalate || actionText.includes('escalat') || actionText.includes('manual') || actionText.includes('ops') || actionText.includes('review')) {
        channel = 'manual';
      } else if (actionText.includes('retry') || actionText.includes('delayed') || actionText.includes('background')) {
        channel = 'auto_retry';
      } else if (actionText.includes('sms') && !actionText.includes('whatsapp')) {
        channel = 'sms';
      } else {
        channel = 'whatsapp';
      }

      setSimResult({
        action: data.recommendedAction || 'Smart Retry',
        confidence: typeof data.confidenceScore === 'number' ? data.confidenceScore : 92,
        whyThisWasSelected: data.whyThisWasSelected || {
          failurePattern: `Gateway failure classified as ${simReason.replace(/_/g, ' ')}.`,
          recoveryLikelihood: `High probability of recovery through selected channel.`,
          costBenefit: `Minimal intervention cost compared to ₹${simAmount.toLocaleString()} order value.`,
        },
        constraintChecks: Array.isArray(data.constraintChecks) && data.constraintChecks.length > 0
          ? data.constraintChecks
          : [
              { constraint: 'Recovery cost below transaction value', status: 'Passed' },
              { constraint: 'Customer risk score acceptable', status: simReason === 'risk_declined' ? 'Failed' : 'Passed' },
              { constraint: 'Retry attempts within policy limit', status: 'Passed' },
              { constraint: 'Within optimal retry time window', status: simReason === 'card_expired' ? 'Failed' : 'Passed' }
            ],
        message: data.escalate ? '' : (data.customerMessage || `Hi ${simCustomer}, please complete your payment: https://rzp.io/i/rec_${Math.floor(Math.random() * 89999 + 10000)}`),
        escalate: Boolean(data.escalate),
        channel,
        errorCode: `RZP_${simReason.toUpperCase()}_DETECTED`,
        isLiveAi: true,
      });
      setIsLiveGemini(true);
      showToast(data.escalate ? 'AI flagged transaction for Human Review.' : 'Live Gemini AI generated structured recovery plan!');
    } catch (err: any) {
      console.warn('Gemini simulation fallback triggered:', err);
      setSimError('AI analysis temporarily unavailable');
      showToast('AI analysis temporarily unavailable — executed fallback strategy.');

      // Fallback heuristics so merchant flow continues smoothly without interruption
      const shouldEscalate = simReason === 'risk_declined' || simAmount > 20000;
      let action = shouldEscalate ? 'Escalate for Manual Review' : 'Smart Retry';
      let failurePattern = `Gateway decline identified due to ${simReason.replace(/_/g, ' ')}.`;
      let recoveryLikelihood = `Targeted recovery path yields high conversion for this failure profile.`;
      let costBenefit = `Marginal recovery cost is heavily outweighed by ₹${simAmount.toLocaleString()} order value.`;
      let message = `Hi ${simCustomer}, we noticed your payment of ₹${simAmount.toLocaleString()} could not be completed. Finish securely: https://rzp.io/i/rec_${Math.floor(Math.random() * 89999 + 10000)}`;
      let confidence = 89;
      let channel: 'whatsapp' | 'auto_retry' | 'sms' | 'manual' = 'whatsapp';

      if (shouldEscalate) {
        channel = 'manual';
        confidence = 94;
        failurePattern = simReason === 'risk_declined'
          ? 'Transaction flagged by gateway risk evaluation filter.'
          : 'High-value transaction exceeding ₹20,000 policy threshold.';
        recoveryLikelihood = 'Manual VIP intervention prevents customer churn without dispute liability.';
        costBenefit = 'Merchant liability protection heavily outweighs autonomous retry risk.';
        message = '';
      } else if (simReason === 'insufficient_funds') {
        action = simAmount >= 500 && settings.discountAbove500 ? 'Incentivized Retry' : 'Payment Link';
        failurePattern = 'Customer account balance fell below authorization charge amount.';
        recoveryLikelihood = 'WhatsApp payment link gives customer immediate buffer to replenish funds.';
        costBenefit = `Minimal message dispatch fee protects full ₹${simAmount.toLocaleString()} revenue.`;
        confidence = 92;
        channel = 'whatsapp';
      } else if (simReason === 'card_expired') {
        action = 'Payment Link';
        failurePattern = 'Card expiration date check declined by card network.';
        recoveryLikelihood = 'Payment link lets customer seamlessly enter an updated active card.';
        costBenefit = 'Preserves customer relationship without hitting repeated card network reject penalties.';
        confidence = 95;
        channel = 'sms';
      } else if (simReason === 'bank_server_timeout') {
        action = 'Smart Retry';
        failurePattern = 'Transient bank core banking switch timeout during traffic surge.';
        recoveryLikelihood = 'Autonomous scheduled retry succeeds once bank nodes stabilize.';
        costBenefit = 'Zero customer friction with automatic revenue capture in background.';
        confidence = 96;
        channel = 'auto_retry';
      } else if (simReason === 'otp_timeout') {
        action = 'Payment Link';
        failurePattern = 'Customer authentication session expired at 3DS OTP step.';
        recoveryLikelihood = 'Direct 1-click payment link bypasses SMS delivery bottleneck.';
        costBenefit = 'Recovers high-intent customer before session permanently abandons.';
        confidence = 91;
        channel = 'whatsapp';
      }

      const constraintChecks: Array<{ constraint: string; status: 'Passed' | 'Failed' }> = [
        {
          constraint: 'Recovery cost below transaction value',
          status: simAmount < 50 ? 'Failed' : 'Passed',
        },
        {
          constraint: 'Customer risk score acceptable',
          status: simReason === 'risk_declined' ? 'Failed' : 'Passed',
        },
        {
          constraint: 'Retry attempts within policy limit',
          status: simReason === 'card_expired' ? 'Failed' : 'Passed',
        },
        {
          constraint: 'Within optimal retry time window',
          status: simReason === 'card_expired' ? 'Failed' : 'Passed',
        },
      ];

      setSimResult({
        action,
        confidence,
        whyThisWasSelected: {
          failurePattern,
          recoveryLikelihood,
          costBenefit,
        },
        constraintChecks,
        message,
        escalate: shouldEscalate,
        channel,
        errorCode: `GATEWAY_ERROR_${simReason.toUpperCase()}`,
        isLiveAi: false,
      });
      setIsLiveGemini(false);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsSimulating(false);
      setSimStep(0);
    }
  };

  // Add simulated result into the active transactions list
  const handleAddSimResultToFeed = () => {
    if (!simResult) return;

    const newTx: Transaction = {
      id: `pay_Rzp${Math.floor(Math.random() * 89999 + 10000)}`,
      customerName: simCustomer,
      customerEmail: `${simCustomer.toLowerCase().replace(' ', '.')}@gmail.com`,
      customerPhone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      amount: simAmount,
      failureReason: simReason,
      aiAction: simResult.action,
      status: simResult.escalate ? 'Pending' : 'Recovering',
      timestamp: 'Just now',
      confidenceScore: simResult.confidence,
      paymentMethod: simMethod,
      gatewayErrorCode: simResult.errorCode,
      aiReasoning: `${simResult.whyThisWasSelected.failurePattern} ${simResult.whyThisWasSelected.recoveryLikelihood}`,
      retryAttempts: 1,
      actionChannel: simResult.channel,
      optimalTimeWindow: simResult.escalate ? 'Manual Hold' : 'Calculated by Agent',
      customerTier: simTier,
      recoveryMessage: simResult.message || 'Escalated for human review.'
    };

    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Simulation added to Live Feed! Watch it in the Dashboard.`);
    setActiveTab('dashboard');
    setSelectedTx(newTx);
  };

  // Format failure reason badge
  const getReasonBadge = (reason: FailureReason) => {
    switch (reason) {
      case 'insufficient_funds':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Insufficient Funds
          </span>
        );
      case 'card_expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3 text-blue-500" />
            Card Expired
          </span>
        );
      case 'bank_server_timeout':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-500" />
            Bank Server Timeout
          </span>
        );
      case 'risk_declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            Risk Declined
          </span>
        );
      case 'otp_timeout':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Smartphone className="w-3 h-3 text-indigo-500" />
            OTP Timeout
          </span>
        );
      case 'network_error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Zap className="w-3 h-3 text-slate-500" />
            Network Dropped
          </span>
        );
    }
  };

  // Format Status Badge
  const getStatusBadge = (status: RecoveryStatus) => {
    switch (status) {
      case 'Recovered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Recovered
          </span>
        );
      case 'Recovering':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
            Recovering
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending Action
          </span>
        );
      case 'Lost':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Lost
          </span>
        );
    }
  };

  return (
    <div id="nabbit-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* ========================================================================= */}
      {/* LEFT SIDEBAR - Modern Dark Fintech Style */}
      {/* ========================================================================= */}
      <aside id="app-sidebar" className="w-full md:w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-5 shrink-0">
        <div>
          {/* Logo & Razorpay Badge */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">Nabbit</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    Agent
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">for Razorpay Merchants</p>
              </div>
            </div>
          </div>

          {/* Merchant Credentials info */}
          <div className="my-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-medium">Active Merchant</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live Webhooks
              </span>
            </div>
            <p className="font-mono text-slate-200 font-semibold text-[13px] truncate">BharatRetail Private Ltd.</p>
            <p className="font-mono text-[11px] text-slate-500 mt-0.5">MID: rzp_live_918204bXa</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              id="nav-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Recovery Dashboard</span>
            </button>

            <button
              id="nav-btn-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI Action Simulator</span>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                Live Test
              </span>
            </button>

            <button
              id="nav-btn-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>14-Day Revenue Analytics</span>
            </button>

            <button
              id="nav-btn-rules"
              onClick={() => setActiveTab('rules')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                activeTab === 'rules'
                  ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Autonomous Rules</span>
            </button>
          </nav>

          {/* Quick Demo Trigger */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Live Demo Actions</p>
            <button
              id="btn-quick-failure-trigger"
              onClick={handleQuickAddFailure}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-teal-400" />
              Simulate Incoming Failure
            </button>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Razorpay API v1
            </span>
            <span className="text-slate-500 font-mono">99.9% Uptime</span>
          </div>
          <p className="text-[11px] text-slate-400">Autonomous recovery eliminates drop-offs automatically.</p>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA - Crisp, Light Fintech Work Area */}
      {/* ========================================================================= */}
      <main id="app-main-content" className="flex-1 flex flex-col min-w-0 bg-slate-50 text-slate-800 overflow-y-auto min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'dashboard' && 'Autonomous Payment Recovery Dashboard'}
              {activeTab === 'simulator' && 'Recovery Action Simulator Sandbox'}
              {activeTab === 'analytics' && '14-Day Revenue Retention Analytics'}
              {activeTab === 'rules' && 'Autonomous Agent Settings & Threshold Rules'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzing Razorpay webhook stream • Real-time failure classification &amp; recovery
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Autonomous Agent: Active</span>
            </div>

            <button
              id="header-simulator-shortcut"
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Failure
            </button>
          </div>
        </header>

        {/* Floating Notification Toast */}
        {notificationToast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-xs font-medium">{notificationToast}</span>
            <button onClick={() => setNotificationToast(null)} className="ml-auto text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* ===================================================================== */}
          {/* TAB: DASHBOARD VIEW */}
          {/* ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1: Revenue at Risk */}
                <div id="stat-card-revenue-at-risk" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Revenue at Risk</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                      <AlertCircle className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {formatINR(metrics.revenueAtRisk)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-amber-600 font-semibold">{transactions.length} total failures</span>
                    <span>monitored by Nabbit</span>
                  </div>
                </div>

                {/* Stat 2: Recovered This Week */}
                <div id="stat-card-recovered" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Recovered This Week</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <TrendingUp className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                      {formatINR(metrics.recoveredThisWeek)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center text-emerald-700 font-semibold">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +24.8%
                    </span>
                    <span>uplift vs manual retry</span>
                  </div>
                </div>

                {/* Stat 3: Recovery Rate % */}
                <div id="stat-card-recovery-rate" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Recovery Rate %</span>
                    <span className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                      <Percent className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {metrics.recoveryRate}%
                    </span>
                    <span className="text-xs font-medium text-slate-500">overall</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-teal-700 font-semibold">Industry avg: 18%</span>
                    <span>(Nabbit +56%)</span>
                  </div>
                </div>

                {/* Stat 4: Active Recovery Attempts */}
                <div id="stat-card-active-attempts" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                    <span>Active Recovery Attempts</span>
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <RefreshCw className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                      {metrics.activeAttempts} In Flight
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-indigo-700 font-semibold">{formatINR(metrics.totalRecovering)}</span>
                    <span>in current recovery pipelines</span>
                  </div>
                </div>
              </div>

              {/* 14-DAY REVENUE RECOVERY CHART */}
              <div id="dashboard-chart-card" className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-600" />
                      Recovered vs Lost Revenue (Last 14 Days)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Visualizing daily revenue recovered autonomously by Nabbit compared to unrecoverable drops
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-medium">
                      <button
                        onClick={() => setChartMode('bar')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          chartMode === 'bar' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Stacked Bar
                      </button>
                      <button
                        onClick={() => setChartMode('area')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          chartMode === 'area' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Area Trend
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === 'bar' ? (
                      <BarChart data={FOURTEEN_DAY_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          stroke="#cbd5e1"
                          tickFormatter={(val) => `₹${val / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatINR(value),
                            name === 'recovered' ? 'Recovered Revenue' : 'Lost Revenue'
                          ]}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            color: '#fff',
                            border: '1px solid #334155',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                          formatter={(value) => (value === 'recovered' ? 'Recovered Revenue (₹)' : 'Lost Revenue (₹)')}
                        />
                        <Bar dataKey="recovered" name="recovered" fill="#0d9488" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="lost" name="lost" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" />
                      </BarChart>
                    ) : (
                      <AreaChart data={FOURTEEN_DAY_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          stroke="#cbd5e1"
                          tickFormatter={(val) => `₹${val / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatINR(value),
                            name === 'recovered' ? 'Recovered' : 'Lost'
                          ]}
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            color: '#fff',
                            border: '1px solid #334155',
                            fontSize: '12px'
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                          formatter={(value) => (value === 'recovered' ? 'Recovered Revenue (₹)' : 'Lost Revenue (₹)')}
                        />
                        <Area
                          type="monotone"
                          dataKey="recovered"
                          stroke="#0d9488"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRecovered)"
                        />
                        <Area
                          type="monotone"
                          dataKey="lost"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorLost)"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LIVE-FEED STYLE FAILED TRANSACTIONS TABLE */}
              <div id="transactions-feed-card" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
                {/* Feed Table Header & Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">Recent Failed Transactions Feed</h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        {filteredTransactions.length} of {transactions.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click any transaction row to inspect AI reasoning, classification logs, and trigger custom recovery.
                    </p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="search-transactions-input"
                        type="text"
                        placeholder="Search customer, payment ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-800"
                      />
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                      {(['All', 'Pending', 'Recovering', 'Recovered', 'Lost'] as const).map((st) => (
                        <button
                          key={st}
                          id={`filter-status-${st.toLowerCase()}`}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                            statusFilter === st ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Reason Category Selector */}
                    <select
                      id="filter-reason-select"
                      value={reasonFilter}
                      onChange={(e) => setReasonFilter(e.target.value)}
                      aria-label="Filter by failure reason"
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    >
                      <option value="All">All Failure Reasons</option>
                      <option value="insufficient_funds">Insufficient Funds</option>
                      <option value="card_expired">Card Expired</option>
                      <option value="bank_server_timeout">Bank Server Timeout</option>
                      <option value="risk_declined">Risk Declined</option>
                      <option value="otp_timeout">OTP Timeout</option>
                      <option value="network_error">Network Dropped</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                        <th className="py-3 px-4">Customer &amp; Payment Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Failure Reason</th>
                        <th className="py-3 px-4">AI Recommended Action</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No failed transactions match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            id={`tx-row-${tx.id}`}
                            onClick={() => setSelectedTx(tx)}
                            className={`group hover:bg-teal-50/30 cursor-pointer transition-colors ${
                              selectedTx?.id === tx.id ? 'bg-teal-50/60 border-l-4 border-teal-500' : ''
                            }`}
                          >
                            {/* Customer info */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 group-hover:border-teal-300">
                                  {tx.customerName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    <span>{tx.customerName}</span>
                                    {tx.customerTier === 'VIP' && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                                        VIP
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <span>{tx.paymentMethod}</span>
                                    <span>•</span>
                                    <span className="font-mono text-[10px] text-slate-400">{tx.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 text-sm">{formatINR(tx.amount)}</span>
                            </td>

                            {/* Failure Reason */}
                            <td className="py-3 px-4">{getReasonBadge(tx.failureReason)}</td>

                            {/* AI Recommended Action */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="p-1 rounded bg-teal-50 text-teal-700 border border-teal-200">
                                  <Sparkles className="w-3 h-3 text-teal-600" />
                                </span>
                                <span className="font-medium text-slate-800">{tx.aiAction}</span>
                              </div>
                              <div className="text-[10px] text-teal-700/80 font-semibold mt-0.5 pl-6">
                                {tx.confidenceScore}% confidence
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>

                            {/* Action Button */}
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {tx.status !== 'Recovered' && (
                                  <button
                                    id={`btn-quick-recover-${tx.id}`}
                                    onClick={() => handleTriggerRecovery(tx.id)}
                                    title="Trigger Recovery Now"
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-all flex items-center gap-1 shadow-sm"
                                  >
                                    <Play className="w-3 h-3 text-teal-600" />
                                    Recover
                                  </button>
                                )}
                                <button
                                  id={`btn-view-details-${tx.id}`}
                                  onClick={() => setSelectedTx(tx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                                  title="View AI Analysis"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer status summary */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span>Showing {filteredTransactions.length} transaction failures in active log</span>
                  <span className="font-medium text-slate-600">
                    Nabbit autonomous loop runs every 60 seconds
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: SIMULATOR VIEW (Core Feature #3) */}
          {/* ===================================================================== */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      Autonomous Strategy Sandbox
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      Simulate a New Failed Payment &amp; Watch AI Decide
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      Enter any failed payment scenario below. Nabbit's real-time reasoning agent will analyze the failure
                      friction, customer profile, and gateway telemetry to draft the highest-probability recovery action.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-xs space-y-1">
                    <span className="text-slate-400 block">Agent Intelligence Model</span>
                    <span className="font-mono text-teal-400 font-semibold flex items-center gap-1.5">
                      <Bot className="w-4 h-4" /> Razorpay Recovery-v4.2
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulator Inputs Form (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                    1. Failed Payment Inputs
                  </h3>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input
                      id="sim-input-customer"
                      type="text"
                      value={simCustomer}
                      onChange={(e) => setSimCustomer(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800"
                    />
                  </div>

                  {/* Amount (INR) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Failed Amount (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">₹</span>
                      <input
                        id="sim-input-amount"
                        type="number"
                        min="1"
                        value={simAmount}
                        onChange={(e) => setSimAmount(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Failure Reason Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Failure Reason (Razorpay Gateway Code)
                    </label>
                    <select
                      id="sim-select-reason"
                      value={simReason}
                      onChange={(e) => setSimReason(e.target.value as FailureReason)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 bg-white"
                    >
                      <option value="insufficient_funds">Insufficient Funds (Low Balance Decline)</option>
                      <option value="card_expired">Card Expired (08/26 validity past)</option>
                      <option value="bank_server_timeout">Bank Server Timeout (Issuer gateway throttling)</option>
                      <option value="otp_timeout">OTP Timeout (Customer abandoned 3DS challenge)</option>
                      <option value="risk_declined">Risk Declined (Thirdwatch fraud warning)</option>
                      <option value="network_error">Network Dropped (Socket reset during redirect)</option>
                    </select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      id="sim-select-method"
                      value={simMethod}
                      onChange={(e) => setSimMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 bg-white"
                    >
                      <option value="HDFC Bank Debit Card">HDFC Bank Debit Card ••4102</option>
                      <option value="Google Pay UPI (gpay@okhdfcbank)">Google Pay UPI (ananya@okhdfcbank)</option>
                      <option value="PhonePe UPI (phonepe@ybl)">PhonePe UPI (rahul@ybl)</option>
                      <option value="ICICI Coral Credit Card">ICICI Coral Credit Card ••8902</option>
                      <option value="SBI Corporate Netbanking">SBI Corporate Netbanking</option>
                      <option value="Axis Bank Netbanking">Axis Bank Netbanking</option>
                    </select>
                  </div>

                  {/* Customer Tier */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Profile / Tier</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Regular', 'VIP', 'New'] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSimTier(tier)}
                          className={`py-1.5 text-xs rounded-lg font-semibold transition-all border ${
                            simTier === tier
                              ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Run Simulation Button */}
                  <div className="pt-2">
                    <button
                      id="btn-run-simulation"
                      disabled={isSimulating}
                      onClick={handleRunSimulator}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>AI Agent analyzing failure...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run AI Recovery Agent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI Agent Decision Panel (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                          2. Real-Time AI Autonomous Decision
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Strategy selection, confidence telemetry, and personalized message generation
                        </p>
                      </div>

                      {simResult && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {isLiveGemini && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Live Gemini
                            </span>
                          )}
                          {simResult.escalate ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              Escalated for Human Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Strategy Ready ({simResult.confidence}% Confidence)
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fallback notification banner if Gemini call encounters issue */}
                    {simError && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>AI analysis temporarily unavailable:</strong> Displaying local autonomous fallback recovery plan.
                        </span>
                      </div>
                    )}

                    {/* Step-by-step thinking animation */}
                    {isSimulating && (
                      <div className="my-8 py-8 px-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-center gap-3">
                          <Bot className="w-6 h-6 text-teal-600 animate-bounce" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                              AI Agent analyzing failure...
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                              MID: rzp_live_9182 • Gateway Error: {simReason.toUpperCase()} • Amount: {formatINR(simAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-teal-600 via-indigo-600 to-teal-600 h-1.5 transition-all duration-500 animate-pulse"
                            style={{ width: `${Math.max(simStep * 33, 25)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Simulation Result */}
                    {!isSimulating && simResult && (
                      <div className="mt-5 space-y-4">
                        {/* Chosen Strategy / Escalation Status */}
                        {simResult.escalate ? (
                          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-rose-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                                Escalated for Human Review
                              </span>
                              <span className="font-bold text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded text-[11px]">
                                {simResult.confidence}% Confidence
                              </span>
                            </div>
                            <p className="font-extrabold text-slate-900 text-base">{simResult.action}</p>
                            <p className="text-xs text-rose-700 mt-1">
                              High risk or high transaction value detected. Automated recovery suspended; ticket routed to merchant operations review.
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-teal-800 uppercase tracking-wider text-[11px]">
                                Recommended Recovery Action
                              </span>
                              <span className="font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded text-[11px]">
                                Channel: {simResult.channel.toUpperCase()} • {simResult.confidence}% Confidence
                              </span>
                            </div>
                            <p className="font-extrabold text-slate-900 text-base">{simResult.action}</p>
                          </div>
                        )}

                        {/* Why This Was Selected (3 short labeled lines) */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                          <div className="flex items-center gap-2 mb-0.5 border-b border-slate-200/80 pb-2">
                            <Bot className="w-4 h-4 text-indigo-600" />
                            <span className="font-bold text-xs text-slate-900">Why This Was Selected</span>
                          </div>

                          <div className="space-y-2.5 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 bg-white p-2.5 rounded-lg border border-slate-200/70">
                              <span className="font-bold text-slate-600 sm:w-40 shrink-0 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                Failure Pattern:
                              </span>
                              <span className="text-slate-800 font-medium leading-relaxed">
                                {simResult.whyThisWasSelected?.failurePattern}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 bg-white p-2.5 rounded-lg border border-slate-200/70">
                              <span className="font-bold text-slate-600 sm:w-40 shrink-0 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                                Recovery Likelihood:
                              </span>
                              <span className="text-slate-800 font-medium leading-relaxed">
                                {simResult.whyThisWasSelected?.recoveryLikelihood}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 bg-white p-2.5 rounded-lg border border-slate-200/70">
                              <span className="font-bold text-slate-600 sm:w-40 shrink-0 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                Cost-Benefit:
                              </span>
                              <span className="text-slate-800 font-medium leading-relaxed">
                                {simResult.whyThisWasSelected?.costBenefit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Constraint Checks (small table/list with checkmark and X) */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <div className="flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-teal-600" />
                              <span className="font-bold text-xs text-slate-900">Constraint Checks</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {simResult.constraintChecks?.filter((c) => c.status === 'Passed').length || 0} of {simResult.constraintChecks?.length || 4} Passed
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {simResult.constraintChecks?.map((check, idx) => {
                              const isPassed = check.status === 'Passed';
                              return (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                                    isPassed
                                      ? 'bg-white border-emerald-200 text-slate-800'
                                      : 'bg-rose-50/70 border-rose-200 text-rose-950 font-medium'
                                  }`}
                                >
                                  <span className="font-medium truncate pr-2 text-slate-700">{check.constraint}</span>
                                  <span
                                    className={`inline-flex items-center gap-1 font-bold text-[11px] shrink-0 px-2 py-0.5 rounded ${
                                      isPassed
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                    }`}
                                  >
                                    {isPassed ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                        Passed
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3 text-rose-600 stroke-[3]" />
                                        Failed
                                      </>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Drafted Customer Message - only shown if NOT escalated */}
                        {!simResult.escalate && (
                          <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                                <span className="font-bold text-xs text-emerald-900">
                                  Suggested Customer Message Draft (WhatsApp / SMS)
                                </span>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                1-Click Razorpay Link
                              </span>
                            </div>

                            <div className="p-3 bg-white rounded-lg border border-emerald-100 font-mono text-xs text-slate-800 leading-normal">
                              {simResult.message}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Placeholder when not simulated yet */}
                    {!isSimulating && !simResult && (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <Bot className="w-12 h-12 mx-auto text-slate-300" />
                        <p className="text-sm font-semibold text-slate-600">No Simulation Run Yet</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Configure the failed transaction parameters on the left and click "Run AI Recovery Agent" to view
                          the autonomous recovery decision.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Simulator Action Footer */}
                  {simResult && !isSimulating && (
                    <div className="pt-4 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <button
                        onClick={handleAddSimResultToFeed}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Add to Live Recovery Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: 14-DAY ANALYTICS VIEW */}
          {/* ===================================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                      14-Day Revenue Retention &amp; Recovery Analysis
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Detailed telemetry of payments saved by Nabbit over the last two weeks
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1 rounded-lg">
                    Avg Recovery Rate: <span className="text-teal-700 font-bold">81.8%</span>
                  </div>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FOURTEEN_DAY_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        stroke="#cbd5e1"
                        tickFormatter={(val) => `₹${val / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatINR(value),
                          name === 'recovered' ? 'Recovered Revenue' : 'Lost Revenue'
                        ]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          color: '#fff',
                          border: '1px solid #334155',
                          fontSize: '12px'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        formatter={(value) => (value === 'recovered' ? 'Recovered by Nabbit (₹)' : 'Lost Due to Non-Recovery (₹)')}
                      />
                      <Bar dataKey="recovered" name="recovered" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="lost" name="lost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recovery Channel Efficiency Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">WhatsApp 1-Click Link</span>
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">89.4%</p>
                  <p className="text-xs text-slate-500">Conversion on Insufficient Funds &amp; OTP Dropouts</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Smart Delayed Retry</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">96.1%</p>
                  <p className="text-xs text-slate-500">Autonomous resolution on Bank &amp; Gateway Outages</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">5% Incentive Nudge</span>
                    <Percent className="w-4 h-4 text-teal-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">74.8%</p>
                  <p className="text-xs text-slate-500">Cart recovery above ₹500 purchase values</p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB: RULES / SETTINGS PANEL (Core Feature #4) */}
          {/* ===================================================================== */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6 max-w-4xl">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-teal-600" />
                    Autonomous Recovery Rules &amp; Policies
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set autonomous threshold boundaries for when Nabbit retries payments, offers discount vouchers, or escalates.
                  </p>
                </div>

                {/* Rule 1: Auto-retry after hours */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-slate-900">Auto-Retry on Bank Outages</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      When Razorpay gateway returns issuer downtime or network socket errors, automatically queue a silent retry.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      id="select-retry-window"
                      value={settings.autoRetryHours}
                      onChange={(e) => setSettings({ ...settings, autoRetryHours: e.target.value })}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                    >
                      <option value="30 mins">Retry after 30 mins</option>
                      <option value="1 hour">Retry after 1 hour</option>
                      <option value="2 hours">Retry after 2 hours (Recommended)</option>
                      <option value="4 hours">Retry after 4 hours</option>
                    </select>

                    <input
                      id="toggle-auto-retry"
                      type="checkbox"
                      checked={settings.autoRetryEnabled}
                      onChange={(e) => setSettings({ ...settings, autoRetryEnabled: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rule 2: Offer discount above threshold */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-sm text-slate-900">Incentivized Recovery Discounts</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      Offer an automated discount nudge on WhatsApp when payments above ₹500 fail due to insufficient funds.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span>Discount:</span>
                      <select
                        id="select-discount-percent"
                        value={settings.discountPercent}
                        onChange={(e) => setSettings({ ...settings, discountPercent: Number(e.target.value) })}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                      >
                        <option value={5}>5% off</option>
                        <option value={10}>10% off</option>
                        <option value={15}>15% off</option>
                      </select>
                    </div>

                    <input
                      id="toggle-discount-incentive"
                      type="checkbox"
                      checked={settings.discountAbove500}
                      onChange={(e) => setSettings({ ...settings, discountAbove500: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rule 3: Escalate after retries */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span className="font-bold text-sm text-slate-900">Escalate to VIP Merchant Ops</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      Flag transaction for manual merchant follow-up when automated attempts fail or fraud risk exceeds threshold.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      id="select-escalate-retries"
                      value={settings.escalateAfterRetries}
                      onChange={(e) => setSettings({ ...settings, escalateAfterRetries: Number(e.target.value) })}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
                    >
                      <option value={1}>After 1 failed retry</option>
                      <option value={2}>After 2 failed retries (Default)</option>
                      <option value={3}>After 3 failed retries</option>
                    </select>

                    <input
                      id="toggle-escalate"
                      type="checkbox"
                      checked={settings.escalateEnabled}
                      onChange={(e) => setSettings({ ...settings, escalateEnabled: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rule 4: Channels & Customer Respect */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-teal-600" />
                      <span className="font-bold text-sm text-slate-900">Customer Safe-Contact Hours</span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">
                      Prevent WhatsApp or SMS recovery links from sending during night hours (9:00 PM – 9:00 AM IST).
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono">09:00 - 21:00 IST</span>
                    <input
                      id="toggle-safe-hours"
                      type="checkbox"
                      checked={settings.safeHoursOnly}
                      onChange={(e) => setSettings({ ...settings, safeHoursOnly: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Webhook Connection Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500">Connected Razorpay Webhooks</span>
                  <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs flex items-center justify-between">
                    <span className="truncate">https://api.nabbit.io/v1/webhooks/rzp_live_918204bXa</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      200 OK
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Listening for events: <code className="text-slate-700 font-semibold">payment.failed</code>,{' '}
                    <code className="text-slate-700 font-semibold">payment.captured</code>,{' '}
                    <code className="text-slate-700 font-semibold">order.paid</code>
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    id="btn-save-rules"
                    onClick={() => showToast('Autonomous recovery rules and thresholds saved successfully!')}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Save Rule Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* DETAIL DRAWER / MODAL (Core Feature #2) */}
        {/* ===================================================================== */}
        {selectedTx && (
          <div
            id="tx-detail-modal"
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}
          >
            <div
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{selectedTx.customerName}</span>
                      <span className="font-mono text-xs text-slate-400">({selectedTx.id})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Failed payment on {selectedTx.paymentMethod} • {selectedTx.timestamp}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-extrabold text-teal-400">{formatINR(selectedTx.amount)}</span>
                  <button
                    id="btn-close-modal"
                    onClick={() => setSelectedTx(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
                {/* Top Status & Classification row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] font-semibold">Current Status</span>
                    <div>{getStatusBadge(selectedTx.status)}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] font-semibold">Failure Classification</span>
                    <div>{getReasonBadge(selectedTx.failureReason)}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-500 text-[11px] font-semibold">Gateway Error Code</span>
                    <div className="font-mono text-slate-800 font-bold truncate">{selectedTx.gatewayErrorCode}</div>
                  </div>
                </div>

                {/* AI REASONING PANEL (Prominent Requirement #2) */}
                <div id="ai-reasoning-panel" className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-indigo-50/40 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-teal-600 text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">Autonomous AI Reasoning</span>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                      {selectedTx.confidenceScore}% Confidence Score
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{selectedTx.aiReasoning}</p>

                  <div className="pt-2 border-t border-teal-200/60 flex flex-wrap items-center justify-between text-[11px] text-teal-900 font-semibold gap-2">
                    <span>Chosen Strategy: {selectedTx.aiAction}</span>
                    <span>Best Time Window: {selectedTx.optimalTimeWindow}</span>
                  </div>
                </div>

                {/* Suggested / Sent Customer Draft Message */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">
                        {selectedTx.status === 'Recovered' ? 'Recovery Message Sent' : 'Live Drafted Recovery Outreach'}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Channel: {selectedTx.actionChannel}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed">
                    {selectedTx.recoveryMessage}
                  </div>
                </div>

                {/* Transaction & Customer Details breakdown */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Customer Profile &amp; Contact
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-medium text-slate-800">{selectedTx.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone</span>
                      <span className="font-medium text-slate-800">{selectedTx.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Customer Tier</span>
                      <span className="font-medium text-slate-800">{selectedTx.customerTier} Account</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Recovery Retries Made</span>
                      <span className="font-medium text-slate-800">{selectedTx.retryAttempts} of 3</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {selectedTx.status === 'Recovered' ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Recovered via {selectedTx.recoveryChannelUsed || 'Nabbit'}
                    </span>
                  ) : (
                    <span>Ready for autonomous execution</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>

                  {selectedTx.status !== 'Recovered' && (
                    <button
                      id="btn-modal-trigger-recovery"
                      onClick={() => handleTriggerRecovery(selectedTx.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Execute Recovery Action Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
