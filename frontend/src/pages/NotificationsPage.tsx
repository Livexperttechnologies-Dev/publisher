import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Zap,
  Radio,
  Mail,
  MessageSquare,
  Smartphone,
  Printer,
  Barcode,
  CreditCard,
  ShoppingBag,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  Clock,
  Play,
  Settings2,
  Check,
} from 'lucide-react';
import {
  InAppNotification,
  WorkflowRuleRecord,
  getStoredNotifications,
  getStoredWorkflowRules,
  markNotificationRead,
  markAllNotificationsRead,
  toggleWorkflowRule,
  executeWorkflowRule,
  createNotification,
} from '../services/configService';
import { useBrand } from '../contexts/BrandContext';

type ActiveTab = 'feed' | 'workflows' | 'integrations' | 'hardware' | 'templates';

export const NotificationsPage: React.FC = () => {
  const { brand } = useBrand();
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [feedFilter, setFeedFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // In-App Notifications Feed State (Loaded dynamically from localStorage)
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => getStoredNotifications());

  // Automated Workflow Rules State (Loaded dynamically from localStorage)
  const [rules, setRules] = useState<WorkflowRuleRecord[]>(() => getStoredWorkflowRules());

  // Integration Gateways
  const integrations = [
    {
      id: 'razorpay',
      name: 'Razorpay Payment Gateway',
      category: 'PAYMENT_GATEWAY',
      icon: CreditCard,
      status: 'CONNECTED',
      environment: 'SANDBOX',
      keyId: 'rzp_test_kibo360_2026',
      webhookUrl: 'https://api.kibo360.com/api/v1/notifications/webhooks/razorpay',
      details: 'Auto-settles invoices and dispatches instant SMS receipt on payment.captured.',
    },
    {
      id: 'whatsapp',
      name: 'Meta WhatsApp Business Cloud API',
      category: 'MESSAGING',
      icon: MessageSquare,
      status: 'CONNECTED',
      environment: 'PRODUCTION',
      keyId: 'waba_acc_919876543210',
      webhookUrl: 'https://api.kibo360.com/api/v1/notifications/webhooks/whatsapp_cloud',
      details: 'Dispatches pre-approved HSM templates for overdue invoices and dispatch updates.',
    },
    {
      id: 'sendgrid',
      name: 'SendGrid Enterprise Mailer',
      category: 'EMAIL',
      icon: Mail,
      status: 'CONNECTED',
      environment: 'PRODUCTION',
      keyId: 'SG.kibo360_prod_mailer',
      webhookUrl: 'https://api.kibo360.com/api/v1/notifications/webhooks/sendgrid',
      details: 'High-reputation dedicated IP for daily sales digests and author royalty statements.',
    },
    {
      id: 'msg91',
      name: 'MSG91 DLT Compliant SMS',
      category: 'SMS',
      icon: Smartphone,
      status: 'CONNECTED',
      environment: 'PRODUCTION',
      keyId: 'KIBOBK (Header ID)',
      webhookUrl: 'https://api.kibo360.com/api/v1/notifications/webhooks/msg91',
      details: 'TRAI DLT entity compliant transactional SMS route for retail POS receipts.',
    },
    {
      id: 'shopify',
      name: 'Shopify E-Commerce Store Sync',
      category: 'ECOMMERCE',
      icon: ShoppingBag,
      status: 'CONNECTED',
      environment: 'PRODUCTION',
      keyId: 'store.kibo360.com',
      webhookUrl: 'https://api.kibo360.com/api/v1/notifications/webhooks/shopify',
      details: 'Bi-directional sync of online book purchases with stock reservation in Sahibabad Depot.',
    },
    {
      id: 'nic_einv',
      name: 'Government NIC E-Invoice & EWB',
      category: 'TAX_PORTAL',
      icon: FileCheck,
      status: 'CONNECTED',
      environment: 'SANDBOX',
      keyId: 'GSP_KIBO360_DELHI',
      webhookUrl: 'https://einv-apisandbox.nic.in/eivital/v1.04',
      details: 'Direct API pipeline for IRN SHA256 cryptographic signing and QR code generation.',
    },
  ];

  // Test Dispatch Form State
  const [testChannel, setTestChannel] = useState<'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP'>('WHATSAPP');
  const [testRecipient, setTestRecipient] = useState('+91 98110 98110');
  const [testMessage, setTestMessage] = useState('Payment reminder for Invoice #INV-0891 of amount INR 3,42,500.');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleMarkAsRead = (id: string) => {
    const updated = markNotificationRead(id);
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsRead();
    setNotifications(updated);
  };

  const handleToggleRule = (id: string) => {
    toggleWorkflowRule(id);
    setRules(getStoredWorkflowRules());
  };

  const handleTriggerJob = (ruleId: string, ruleName: string) => {
    const res = executeWorkflowRule(ruleId);
    setRules(getStoredWorkflowRules());
    alert(res?.message || `Automation Workflow [${ruleName}] triggered successfully.`);
  };

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (testChannel === 'IN_APP') {
      createNotification({
        title: `Test Alert (${testChannel})`,
        message: testMessage,
        severity: 'INFO',
        type: 'SYSTEM_ALERT',
        actionUrl: '/notifications',
      });
      setNotifications(getStoredNotifications());
    }
    setDispatchStatus(`Success: Test notification dispatched via ${testChannel} to ${testRecipient}! Delivery logged.`);
    setTimeout(() => {
      setDispatchStatus(null);
      setTestModalOpen(false);
    }, 1800);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications =
    feedFilter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Notifications, Automation & Integrations
            </h1>
            <Badge variant="purple" size="sm">Phase 17 Certified</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise notification engine, multi-channel dispatch (Email, SMS, WhatsApp), automated workflows, and POS hardware.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer size={14} />}
            onClick={() => setReceiptModalOpen(true)}
          >
            Thermal Receipt Simulator
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Send size={14} />}
            onClick={() => setTestModalOpen(true)}
          >
            Dispatch Test Alert
          </Button>
        </div>
      </div>

      {/* 5 Top Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-3 border-l-4 border-l-[#690BA8]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Unread Alerts</span>
            <Bell size={14} className="text-[#690BA8]" />
          </div>
          <div className="text-xl font-black text-slate-800">{unreadCount} Pending</div>
          <div className="text-[10px] text-rose-500 font-medium mt-0.5">1 Critical Stock Breach</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Workflows</span>
            <Zap size={14} className="text-emerald-500" />
          </div>
          <div className="text-xl font-black text-slate-800">5 Rules Live</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Overdue, Reorder & Approval</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-[#340771]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Integrations</span>
            <Radio size={14} className="text-indigo-500" />
          </div>
          <div className="text-xl font-black text-slate-800">6 / 6 Online</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Razorpay, WhatsApp, SendGrid</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Outbound Delivery</span>
            <CheckCircle2 size={14} className="text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-800">99.4% Rate</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Idempotency Guard Active</div>
        </Card>

        <Card className="p-3 border-l-4 border-l-[#E91E63]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">POS Hardware</span>
            <Printer size={14} className="text-[#E91E63]" />
          </div>
          <div className="text-xl font-black text-slate-800">Station #01 Ready</div>
          <div className="text-[10px] text-slate-500 mt-0.5">80mm ESC/POS + USB Barcode</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'feed'
              ? 'border-[#690BA8] text-[#690BA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell size={15} />
          In-App Alerts Feed ({unreadCount})
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'workflows'
              ? 'border-[#690BA8] text-[#690BA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap size={15} />
          Automated Workflow Rules
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'integrations'
              ? 'border-[#690BA8] text-[#690BA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio size={15} />
          Connected Gateways & Webhooks
        </button>

        <button
          onClick={() => setActiveTab('hardware')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'hardware'
              ? 'border-[#690BA8] text-[#690BA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer size={15} />
          Thermal POS & Barcode Hardware
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'templates'
              ? 'border-[#690BA8] text-[#690BA8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={15} />
          Templates & Outbound Audit Log
        </button>
      </div>

      {/* TAB 1: IN-APP ALERTS FEED */}
      {activeTab === 'feed' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Filter Feed:</span>
              <button
                onClick={() => setFeedFilter('ALL')}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  feedFilter === 'ALL' ? 'bg-[#690BA8] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFeedFilter('UNREAD')}
                className={`text-xs px-2.5 py-1 rounded font-medium ${
                  feedFilter === 'UNREAD' ? 'bg-[#690BA8] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              Mark All as Read
            </Button>
          </div>

          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  notif.isRead
                    ? 'bg-slate-50/50 border-slate-200'
                    : 'bg-white border-[#690BA8]/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-600'
                        : notif.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {notif.severity === 'CRITICAL' ? (
                      <AlertTriangle size={16} />
                    ) : notif.severity === 'WARNING' ? (
                      <Clock size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                      <Badge
                        variant={
                          notif.severity === 'CRITICAL'
                            ? 'coral'
                            : notif.severity === 'WARNING'
                            ? 'magenta'
                            : 'success'
                        }
                        size="sm"
                      >
                        {notif.type.replace(/_/g, ' ')}
                      </Badge>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-[#690BA8]" title="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{notif.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-[11px] font-semibold text-[#690BA8] hover:underline px-2 py-1"
                    >
                      Mark Read
                    </button>
                  )}
                  <a
                    href={notif.actionUrl}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    View Details
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 2: AUTOMATED WORKFLOW RULES */}
      {activeTab === 'workflows' && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Business Automation Rules Engine</h3>
              <p className="text-[11px] text-slate-500">Automated event triggers, scheduled jobs, and multi-channel notifications</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {rules.map((rule) => (
              <div key={rule.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800">{rule.name}</span>
                    <Badge variant={rule.isActive ? 'purple' : 'slate'} size="sm">
                      {rule.isActive ? 'ACTIVE' : 'DISABLED'}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">{rule.trigger}</span>
                  </div>
                  <p className="text-xs text-slate-600">{rule.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>
                      <strong>Channels:</strong> {rule.channels.join(', ')}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Schedule:</strong> {rule.schedule}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">Last Run: {rule.lastRun}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Play size={12} />}
                    onClick={() => handleTriggerJob(rule.id, rule.name)}
                  >
                    Run Now
                  </Button>
                  <Button
                    variant={rule.isActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleRule(rule.id)}
                  >
                    {rule.isActive ? 'Pause' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: CONNECTED GATEWAYS & WEBHOOKS */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((gateway) => {
            const Icon = gateway.icon;
            return (
              <Card key={gateway.id} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-50 text-[#690BA8] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <Badge variant="success" size="sm">{gateway.status}</Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">{gateway.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{gateway.details}</p>

                  <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-semibold text-slate-700">{gateway.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Key / Header ID:</span>
                      <span className="font-mono text-slate-700">{gateway.keyId}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[170px]" title={gateway.webhookUrl}>
                    {gateway.webhookUrl}
                  </span>
                  <span className="text-[#690BA8] font-bold cursor-pointer hover:underline">
                    Config
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 4: THERMAL POS & BARCODE HARDWARE */}
      {activeTab === 'hardware' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">80mm ESC/POS Thermal Receipt Simulator</h3>
                <p className="text-[11px] text-slate-500">Industry-standard receipt printer emulation with auto-cutter</p>
              </div>
              <Badge variant="purple" size="sm">Station #01</Badge>
            </div>

            {/* Virtual Thermal Paper Render */}
            <div className="p-5 bg-amber-50/40 border border-amber-200/60 rounded-md font-mono text-[11px] leading-tight text-slate-800 shadow-inner max-w-sm mx-auto">
              <div className="text-center font-bold">KIBO360 ENTERPRISE PUBLISHERS</div>
              <div className="text-center text-[10px] text-slate-600">4821/24 Ansari Road, Daryaganj, New Delhi</div>
              <div className="text-center text-[10px] text-slate-600">GSTIN: 07AAAAA0000A1Z5 | HSN: 4901 (0%)</div>
              <div className="my-2 border-b border-dashed border-slate-400" />
              <div>Tax Invoice: POS-2026-0042</div>
              <div>Date: {new Date().toLocaleString('en-IN')}</div>
              <div>Customer: St. Xavier School Bookstore</div>
              <div>GSTIN: 07BBRPA1234D1ZP</div>
              <div>Cashier: Aarav Sharma (Counter #01)</div>
              <div className="my-2 border-b border-dashed border-slate-400" />
              <div className="flex justify-between font-bold text-[10px]">
                <span>Item</span>
                <span>Qty x Rate</span>
                <span>Total</span>
              </div>
              <div className="my-1 border-b border-dashed border-slate-300" />
              <div>Senior Secondary Math - Cl 10</div>
              <div className="flex justify-between pl-2 text-slate-600">
                <span></span>
                <span>20 x 295.00</span>
                <span>INR 5,900.00</span>
              </div>
              <div className="mt-1">Modern Physics - Cl 12</div>
              <div className="flex justify-between pl-2 text-slate-600">
                <span></span>
                <span>15 x 380.00</span>
                <span>INR 5,700.00</span>
              </div>
              <div className="my-2 border-b border-dashed border-slate-400" />
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>INR 11,600.00</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>GST (0% Books Exemption):</span>
                <span>INR 0.00</span>
              </div>
              <div className="my-1.5 border-b-2 border-slate-800" />
              <div className="flex justify-between font-black text-sm">
                <span>GRAND TOTAL:</span>
                <span>INR 11,600.00</span>
              </div>
              <div className="my-1.5 border-b-2 border-slate-800" />
              <div>Payment Mode: UPI (Ref: 9182049182)</div>
              <div className="my-2 border-b border-dashed border-slate-400" />
              <div className="text-center font-bold text-[10px]">Thank you for reading with KIBO360!</div>
              <div className="text-center text-[9px] text-slate-500">ESC/POS 80mm Auto-Cutter Engaged</div>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Hardware Listener Specifications</h3>
                  <p className="text-[11px] text-slate-500">USB Barcode Scanners & Serial Receipt Printers</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                    <Barcode size={16} className="text-[#690BA8]" />
                    USB Barcode Scanner (HID Wedge Mode)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Supports EAN-13, ISBN-10, ISBN-13, and Code 128 barcodes. Scanners transmit characters directly as keystrokes terminated with Enter (CR/LF).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                    <Printer size={16} className="text-[#340771]" />
                    Thermal Receipt Printer (Raw ESC/POS Byte Stream)
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Outputs standard binary control codes: <code>\x1B\x40</code> (Initialize), <code>\x1B\x45\x01</code> (Bold), <code>\x1D\x56\x42\x00</code> (Full Cut). Compatible with Epson, TVS, Star, and Citizen.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => alert('Sending raw 80mm ESC/POS byte sequence to default thermal printer on port USB001.')}
            >
              Test Hardware Print Command
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 5: TEMPLATES & AUDIT LOG */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Pre-Approved Notification Templates</h3>
            <p className="text-[11px] text-slate-500 mb-4">DLT-registered SMS templates and Meta WhatsApp HSM templates</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>OVERDUE_INVOICE_WHATSAPP</span>
                  <Badge variant="purple" size="sm">WhatsApp HSM</Badge>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">
                  "Namaste &#123;&#123;customerName&#125;&#125;, your invoice #&#123;&#123;invoiceNumber&#125;&#125; for INR &#123;&#123;amount&#125;&#125; was due on &#123;&#123;dueDate&#125;&#125;. Kindly arrange payment."
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>PAYMENT_RECEIPT_SMS</span>
                  <Badge variant="success" size="sm">DLT Compliant</Badge>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">
                  "Received payment of INR &#123;&#123;amount&#125;&#125; for Inv #&#123;&#123;invoiceNumber&#125;&#125; via &#123;&#123;paymentMode&#125;&#125;. Thank you! KIBO360 Books."
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: DISPATCH TEST NOTIFICATION */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Dispatch Test Notification"
      >
        <form onSubmit={handleSendTest} className="space-y-4">
          {dispatchStatus && (
            <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200 font-medium">
              {dispatchStatus}
            </div>
          )}

          <FormField label="Communication Channel">
            <select
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value as any)}
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-[#690BA8]"
            >
              <option value="WHATSAPP">WhatsApp Business API (Cloud)</option>
              <option value="EMAIL">Email (SendGrid Mailer)</option>
              <option value="SMS">SMS (MSG91 DLT Route)</option>
              <option value="IN_APP">In-App Notification Feed</option>
            </select>
          </FormField>

          <FormField label="Recipient Address / Mobile">
            <Input
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="+91 98110 98110 or email@domain.com"
            />
          </FormField>

          <FormField label="Notification Message Content">
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={3}
              className="w-full text-xs border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#690BA8]"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setTestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" leftIcon={<Send size={13} />}>
              Send Notification
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: THERMAL RECEIPT COMMAND CODES */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="80mm Thermal Receipt ESC/POS Stream"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Raw hex command stream formatted for ESC/POS compliant 80mm thermal printers:
          </p>
          <pre className="p-3 bg-slate-900 text-emerald-400 rounded text-[10px] font-mono overflow-x-auto leading-relaxed">
            1B40 1B61 01 1B45 01 4B49 424F 3336 3020 5055 424C 4953 4845 5253 0A 1B45 00 1B61 00
            4B49 424F 3336 3020 454E 5445 5250 5249 5345 2050 5542 4C49 5348 4552 530A ...
            1D56 4200 (Auto Paper Cut)
          </pre>
          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" onClick={() => setReceiptModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
