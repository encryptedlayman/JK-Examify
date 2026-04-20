export interface Question {
  topic: string;
  statement: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export const ACCOUNTANCY_QUIZ_DATA: Question[] = [
  {
    topic: "Accounting Equation",
    statement: "A business owner withdraws ₹10,000 cash for personal use.",
    q: "Which of the following correctly describes the effect on the accounting equation?",
    opts: ["Assets increase, Capital increases", "Assets decrease, Capital decreases", "Assets increase, Liabilities increase", "No effect on the equation"],
    ans: 1,
    exp: "Drawings reduce both cash (Asset) and Capital, keeping the equation balanced: Assets = Liabilities + Capital."
  },
  {
    topic: "Journal Entry",
    statement: "Goods worth ₹5,000 were returned by a credit customer, Rohit.",
    q: "What is the correct journal entry for this transaction?",
    opts: ["Debit Sales Return A/c; Credit Rohit's A/c", "Debit Rohit's A/c; Credit Sales Return A/c", "Debit Cash A/c; Credit Sales A/c", "Debit Purchases A/c; Credit Rohit's A/c"],
    ans: 0,
    exp: "Sales Returns (inward returns) increase — Dr. Sales Return A/c. Rohit's debtor account is credited as his balance reduces."
  },
  {
    topic: "Bank Reconciliation",
    statement: "A cheque issued to a supplier for ₹8,000 has not yet been presented to the bank for payment.",
    q: "How would this appear in a Bank Reconciliation Statement (starting with Cash Book balance)?",
    opts: ["Add ₹8,000 to Cash Book balance", "Deduct ₹8,000 from Pass Book balance", "Add ₹8,000 to Pass Book balance", "Deduct ₹8,000 from Cash Book balance"],
    ans: 2,
    exp: "Unpresented cheques reduce the Cash Book but not the Pass Book yet, so add the amount to the Pass Book balance to reconcile."
  },
  {
    topic: "Depreciation",
    statement: "A machine bought for ₹1,00,000 has a useful life of 10 years and scrap value of ₹10,000. The firm uses SLM.",
    q: "What is the annual depreciation under the Straight Line Method?",
    opts: ["₹10,000", "₹9,000", "₹11,000", "₹8,000"],
    ans: 1,
    exp: "SLM = (Cost − Scrap) ÷ Life = (1,00,000 − 10,000) ÷ 10 = ₹9,000 per year."
  },
  {
    topic: "Bills of Exchange",
    statement: "Aman draws a bill on Bimal for ₹20,000 for 3 months. Bimal accepts and returns it to Aman.",
    q: "In Aman's books, the bill is recorded as:",
    opts: ["Bills Payable", "Bills Receivable", "Creditor", "Debtor"],
    ans: 1,
    exp: "Aman is the drawer who holds the accepted bill. It is an asset — a Bills Receivable — in Aman's books."
  },
  {
    topic: "Trial Balance",
    statement: "The trial balance of a firm shows total debits = ₹5,42,000 and total credits = ₹5,38,000.",
    q: "Which of the following statements is TRUE about this trial balance?",
    opts: ["It proves the books are accurate", "There is a clerical error of ₹4,000", "There is a compensating error", "The difference may be due to an error of principle"],
    ans: 1,
    exp: "A difference of ₹4,000 (5,42,000 − 5,38,000) indicates a clerical error such as wrong posting or omission."
  },
  {
    topic: "Final Accounts",
    statement: "Closing stock appearing in the Trial Balance is shown only in the Balance Sheet.",
    q: "If closing stock does NOT appear in the Trial Balance, it is shown in:",
    opts: ["Only Balance Sheet", "Only Trading Account (credit side)", "Trading Account (credit) and Balance Sheet (asset)", "Profit & Loss Account only"],
    ans: 2,
    exp: "When closing stock is not in the Trial Balance, it appears on the credit side of Trading A/c AND as a current asset in the Balance Sheet."
  },
  {
    topic: "Errors & Rectification",
    statement: "Salary paid ₹12,000 was wrongly debited to Rent Account.",
    q: "What is the rectifying entry?",
    opts: ["Dr. Rent A/c; Cr. Salary A/c ₹12,000", "Dr. Salary A/c; Cr. Rent A/c ₹12,000", "Dr. Salary A/c; Cr. Cash A/c ₹12,000", "No entry needed"],
    ans: 1,
    exp: "To correct: Debit Salary A/c (correct head) and Credit Rent A/c (to reverse wrong entry). This is an error of commission."
  },
  {
    topic: "Capital & Revenue",
    statement: "A firm spends ₹2,00,000 on overhauling a machine, which increases its useful life by 5 years.",
    q: "This expenditure should be classified as:",
    opts: ["Revenue Expenditure", "Capital Expenditure", "Deferred Revenue Expenditure", "Capital Receipt"],
    ans: 1,
    exp: "Expenditure that extends the life or capacity of a fixed asset beyond original estimates is Capital Expenditure."
  },
  {
    topic: "Provisions & Reserves",
    statement: "A firm creates a reserve to meet a future liability of uncertain amount arising from a court case.",
    q: "This is an example of:",
    opts: ["General Reserve", "Specific Reserve", "Provision", "Capital Reserve"],
    ans: 2,
    exp: "A Provision is made for a known liability of uncertain amount (e.g., legal case). Reserves are appropriations from profit."
  },
  {
    topic: "Partnership — Admission",
    statement: "C is admitted into a partnership firm for 1/4th share. The new profit ratio of A, B, and C is 2:1:1.",
    q: "C's share in profit is 1/4. The sacrificing ratio of A and B is:",
    opts: ["1:1", "2:1", "3:1", "Cannot be determined without old ratio"],
    ans: 3,
    exp: "Without knowing A and B's old ratio, the sacrificing ratio cannot be calculated. Old ratio is essential."
  },
  {
    topic: "Goodwill",
    statement: "Average profit of a firm = ₹60,000. Normal profit = ₹45,000. The number of years' purchase = 3.",
    q: "What is the value of goodwill using the Super Profit method?",
    opts: ["₹1,80,000", "₹45,000", "₹60,000", "₹15,000"],
    ans: 1,
    exp: "Super Profit = Avg Profit − Normal Profit = 60,000 − 45,000 = ₹15,000. Goodwill = 15,000 × 3 = ₹45,000."
  },
  {
    topic: "Retirement of Partner",
    statement: "On retirement of a partner, the revaluation account shows a loss of ₹30,000.",
    q: "This loss will be:",
    opts: ["Credited to all partners' capital in new ratio", "Debited to all partners' capital in old ratio", "Credited to retiring partner only", "Transferred to General Reserve"],
    ans: 1,
    exp: "Revaluation loss is borne by all partners (including the retiring one) in the old profit-sharing ratio."
  },
  {
    topic: "Death of Partner",
    statement: "A partner dies on 1st July. The firm's accounting year ends 31st March. Profits are to be shared till death.",
    q: "Profit credited to the deceased partner's executor will be calculated for:",
    opts: ["Full year", "3 months (April–June)", "6 months", "9 months"],
    ans: 1,
    exp: "From 1st April to 1st July = 3 months. Profit is calculated proportionately for the period the partner was alive."
  },
  {
    topic: "Dissolution of Firm",
    statement: "On dissolution, a creditor accepts machinery (book value ₹40,000) in settlement of his debt of ₹45,000.",
    q: "The gain or loss on this transaction is:",
    opts: ["Loss of ₹5,000 to the firm", "Gain of ₹5,000 to the firm", "No gain or loss", "Loss transferred to Realisation A/c debit side"],
    ans: 1,
    exp: "Creditor accepts ₹40,000 asset for ₹45,000 debt — debt reduced by ₹5,000 more than asset value. Gain of ₹5,000 credited to Realisation A/c."
  },
  {
    topic: "Share Capital",
    statement: "A company issues 10,000 shares of ₹10 each at ₹12. Applications were received for 15,000 shares.",
    q: "The amount received as securities premium on allotment of shares is:",
    opts: ["₹1,50,000", "₹20,000", "₹1,00,000", "₹30,000"],
    ans: 1,
    exp: "Premium = ₹2 per share × 10,000 shares allotted = ₹20,000. (Only allotted shares carry premium.)"
  },
  {
    topic: "Debentures",
    statement: "A company issues 1,000, 9% Debentures of ₹100 each at a discount of 5%, redeemable at par.",
    q: "The amount of discount on issue of debentures is:",
    opts: ["₹9,000", "₹5,000", "₹4,500", "₹10,000"],
    ans: 1,
    exp: "Discount = 5% × ₹1,00,000 face value = ₹5,000. This is a capital loss written off over the debenture's life."
  },
  {
    topic: "Cash Flow Statement",
    statement: "A company purchases machinery worth ₹3,00,000 and pays ₹1,00,000 in cash; balance payable later.",
    q: "In the Cash Flow Statement, the cash outflow under investing activities is:",
    opts: ["₹3,00,000", "₹2,00,000", "₹1,00,000", "Nil"],
    ans: 2,
    exp: "Only the cash actually paid (₹1,00,000) is shown as an outflow. The balance ₹2,00,000 is a non-cash transaction."
  },
  {
    topic: "Ratio Analysis",
    statement: "Current Assets = ₹4,00,000; Current Liabilities = ₹2,00,000; Inventory = ₹80,000.",
    q: "What is the Quick (Acid-Test) Ratio?",
    opts: ["2:1", "1.6:1", "1.5:1", "3:1"],
    ans: 1,
    exp: "Quick Assets = Current Assets − Inventory = 4,00,000 − 80,000 = 3,20,000. Quick Ratio = 3,20,000 ÷ 2,00,000 = 1.6:1."
  },
  {
    topic: "Computerised Accounting",
    statement: "In computerised accounting, the ledger is automatically updated as soon as a journal entry is saved.",
    q: "This feature of computerised accounting is known as:",
    opts: ["Real-time processing", "Batch processing", "Manual posting", "Deferred updating"],
    ans: 0,
    exp: "Real-time processing means data is processed immediately as it is entered, updating all related accounts instantly."
  }
];

export const ACCOUNTANCY_MOCK_DATA: Question[] = [
  ...ACCOUNTANCY_QUIZ_DATA // By default uses the same, can be different
];
