import { Fragment, useCallback, useEffect, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { useCustomFetch } from "./hooks/useCustomFetch"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const { fetchWithoutCache } = useCustomFetch()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [approvedTransactions, setApprovedTransactions] = useState<Record<string, boolean>>({})

  const transactions = selectedEmployeeId ? transactionsByEmployee : paginatedTransactions?.data ?? null

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true)
    transactionsByEmployeeUtils.invalidateData()
    await paginatedTransactionsUtils.fetchAll()
    setIsLoading(false)
    setSelectedEmployeeId(null)
  }, [paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setIsLoading(true)
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
      setIsLoading(false)
      setSelectedEmployeeId(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      employeeUtils.fetchAll()
    }
  }, [employeeUtils, employees])

  useEffect(() => {
    if (paginatedTransactions === null && !paginatedTransactionsUtils.loading) {
      loadAllTransactions()
    }
  }, [paginatedTransactions, paginatedTransactionsUtils.loading, loadAllTransactions])

  const setTransactionApproval = useCallback(
    async ({ transactionId, newValue }: { transactionId: string; newValue: boolean }) => {
      await fetchWithoutCache("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
      setApprovedTransactions((prev) => ({
        ...prev,
        [transactionId]: newValue,
      }))
    },
    [fetchWithoutCache]
  )

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />
        <hr className="RampBreak--l" />
        <InputSelect<Employee>
          isLoading={employeeUtils.loading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            if (newValue.id === EMPTY_EMPLOYEE.id) {
              await loadAllTransactions()
            } else {
              await loadTransactionsByEmployee(newValue.id)
            }
          }}
        />
        <div className="RampBreak--l" />
        <div className="RampGrid">
          <Transactions
            transactions={transactions}
            setTransactionApproval={setTransactionApproval}
            approvedTransactions={approvedTransactions}
          />
          {!selectedEmployeeId && paginatedTransactions?.nextPage && (
            <button
              className="RampButton"
              disabled={isLoading}
              onClick={async () => {
                await paginatedTransactionsUtils.fetchAll()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
