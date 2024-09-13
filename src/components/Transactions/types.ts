import { FunctionComponent } from "react"
import { Transaction } from "../../utils/types"

export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = {
  transactions: Transaction[] | null
  setTransactionApproval: SetTransactionApprovalFunction
  approvedTransactions: Record<string, boolean>
}

type TransactionPaneProps = {
  transaction: Transaction
  setTransactionApproval: SetTransactionApprovalFunction
  approved: boolean
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
