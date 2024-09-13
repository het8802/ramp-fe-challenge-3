import { TransactionPane } from "./TransactionPane"
import { TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({
  transactions,
  setTransactionApproval,
  approvedTransactions,
}) => {
  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          setTransactionApproval={setTransactionApproval}
          approved={approvedTransactions[transaction.id] ?? transaction.approved}
        />
      ))}
    </div>
  )
}
