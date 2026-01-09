'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Building,
    Plus,
    Trash2,
    Star,
    CheckCircle,
    Loader2,
    AlertCircle,
    Globe,
    ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import bankAccountService, { type BankAccount, type Bank } from '@/lib/api/services/bank-account.service'

export default function BankAccountsPage() {
    // Data state
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [banks, setBanks] = useState<Bank[]>([])

    // UI state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [addType, setAddType] = useState<'nigerian' | 'international'>('nigerian')

    // Form state
    const [selectedBank, setSelectedBank] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [accountName, setAccountName] = useState('')
    const [verifying, setVerifying] = useState(false)
    const [verified, setVerified] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // International form fields
    const [intBankName, setIntBankName] = useState('')
    const [intAccountNumber, setIntAccountNumber] = useState('')
    const [intAccountName, setIntAccountName] = useState('')
    const [intSwiftCode, setIntSwiftCode] = useState('')
    const [intCountry, setIntCountry] = useState('')
    const [intCurrency, setIntCurrency] = useState('USD')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            setError(null)

            const [accountsRes, banksRes] = await Promise.all([
                bankAccountService.getAccounts(),
                bankAccountService.getBanks(),
            ])

            setAccounts(accountsRes.data?.accounts || [])
            setBanks(banksRes.data?.banks || [])
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load bank accounts')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyAccount = async () => {
        if (!selectedBank || accountNumber.length !== 10) return

        try {
            setVerifying(true)
            setFormError(null)
            setVerified(false)

            const selectedBankObj = banks.find(b => b.code === selectedBank)
            const response = await bankAccountService.verifyAccount(accountNumber, selectedBank)

            if (response.success && response.data) {
                setAccountName(response.data.account_name)
                setVerified(true)
            } else {
                setFormError(response.message || 'Could not verify account')
            }
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to verify account')
        } finally {
            setVerifying(false)
        }
    }

    const handleAddAccount = async () => {
        try {
            setSaving(true)
            setFormError(null)

            if (addType === 'nigerian') {
                if (!verified) {
                    setFormError('Please verify your account first')
                    return
                }

                const selectedBankObj = banks.find(b => b.code === selectedBank)

                await bankAccountService.addAccount({
                    account_type: 'nigerian',
                    bank_name: selectedBankObj?.name || '',
                    bank_code: selectedBank,
                    account_number: accountNumber,
                    account_name: accountName,
                    currency: 'NGN',
                    country: 'Nigeria',
                })
            } else {
                if (!intBankName || !intAccountNumber || !intAccountName || !intSwiftCode || !intCountry) {
                    setFormError('Please fill in all required fields')
                    return
                }

                await bankAccountService.addAccount({
                    account_type: 'international',
                    bank_name: intBankName,
                    account_number: intAccountNumber,
                    account_name: intAccountName,
                    swift_code: intSwiftCode,
                    country: intCountry,
                    currency: intCurrency,
                })
            }

            setShowAddDialog(false)
            resetForm()
            loadData()
        } catch (err: any) {
            setFormError(err.response?.data?.message || 'Failed to add bank account')
        } finally {
            setSaving(false)
        }
    }

    const handleSetDefault = async (accountId: number) => {
        try {
            await bankAccountService.setDefault(accountId)
            loadData()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to set default')
        }
    }

    const handleDelete = async (accountId: number) => {
        if (!confirm('Are you sure you want to delete this bank account?')) return

        try {
            await bankAccountService.deleteAccount(accountId)
            loadData()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account')
        }
    }

    const resetForm = () => {
        setSelectedBank('')
        setAccountNumber('')
        setAccountName('')
        setVerified(false)
        setFormError(null)
        setIntBankName('')
        setIntAccountNumber('')
        setIntAccountName('')
        setIntSwiftCode('')
        setIntCountry('')
        setIntCurrency('USD')
    }

    // Auto-verify when account number is complete
    useEffect(() => {
        if (accountNumber.length === 10 && selectedBank && !verified) {
            handleVerifyAccount()
        }
    }, [accountNumber, selectedBank])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading bank accounts...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link href="/dashboard/wallet">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bank Accounts</h1>
                        <p className="text-sm text-muted-foreground">Manage your withdrawal bank accounts</p>
                    </div>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Bank Account
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Bank Accounts List */}
            <div className="grid gap-4 md:grid-cols-2">
                {accounts.length === 0 ? (
                    <Card className="md:col-span-2">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Building className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No bank accounts yet</p>
                            <p className="text-muted-foreground mb-4">Add a bank account to receive withdrawals</p>
                            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Bank Account
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    accounts.map(account => (
                        <Card key={account.id} className={account.is_default ? 'border-primary' : ''}>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${account.account_type === 'nigerian' ? 'bg-success/10' : 'bg-primary/10'
                                            }`}>
                                            {account.account_type === 'nigerian' ? (
                                                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                                            ) : (
                                                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm sm:text-base truncate">{account.bank_name}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                ****{account.account_number.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {account.is_default && (
                                            <Badge variant="default" className="gap-1">
                                                <Star className="h-3 w-3" /> Default
                                            </Badge>
                                        )}
                                        <Badge variant={account.account_type === 'nigerian' ? 'secondary' : 'outline'}>
                                            {account.account_type === 'nigerian' ? 'Nigerian' : 'International'}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Account Name</span>
                                        <span className="truncate ml-2">{account.account_name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-muted-foreground">Currency</span>
                                        <span>{account.currency}</span>
                                    </div>
                                    {account.swift_code && (
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-muted-foreground">SWIFT Code</span>
                                            <span>{account.swift_code}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    {!account.is_default && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleSetDefault(account.id)}
                                        >
                                            <Star className="h-4 w-4 mr-1" />
                                            Set Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(account.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Add Bank Account Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Bank Account</DialogTitle>
                        <DialogDescription>
                            Add a bank account for withdrawals
                        </DialogDescription>
                    </DialogHeader>

                    {formError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{formError}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={addType} onValueChange={(v) => setAddType(v as 'nigerian' | 'international')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="nigerian">Nigerian Bank</TabsTrigger>
                            <TabsTrigger value="international">International</TabsTrigger>
                        </TabsList>

                        <TabsContent value="nigerian" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Select Bank</Label>
                                <Select value={selectedBank} onValueChange={setSelectedBank}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose your bank" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {banks.map(bank => (
                                            <SelectItem key={bank.code} value={bank.code}>
                                                {bank.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Account Number</Label>
                                <div className="relative">
                                    <Input
                                        placeholder="0123456789"
                                        value={accountNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                            setAccountNumber(val)
                                            setVerified(false)
                                        }}
                                        maxLength={10}
                                    />
                                    {verifying && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                                    )}
                                    {verified && (
                                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
                                    )}
                                </div>
                            </div>

                            {verified && (
                                <div className="p-4 bg-success/10 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Account Name</p>
                                    <p className="font-semibold text-success">{accountName}</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="international" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Bank Name *</Label>
                                    <Input
                                        placeholder="e.g., Chase Bank"
                                        value={intBankName}
                                        onChange={(e) => setIntBankName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Account Holder Name *</Label>
                                    <Input
                                        placeholder="Full name as on account"
                                        value={intAccountName}
                                        onChange={(e) => setIntAccountName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number *</Label>
                                    <Input
                                        placeholder="Account number"
                                        value={intAccountNumber}
                                        onChange={(e) => setIntAccountNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SWIFT/BIC Code *</Label>
                                    <Input
                                        placeholder="e.g., CHASUS33"
                                        value={intSwiftCode}
                                        onChange={(e) => setIntSwiftCode(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country *</Label>
                                    <Input
                                        placeholder="e.g., United States"
                                        value={intCountry}
                                        onChange={(e) => setIntCountry(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={intCurrency} onValueChange={setIntCurrency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    International withdrawals are processed manually and may take 3-5 business days.
                                </AlertDescription>
                            </Alert>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddAccount} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Add Account'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
