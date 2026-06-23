import { useState, useEffect } from "react";

import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function App() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [backendMessage, setBackendMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  useEffect(() => {
  const savedUser =
    localStorage.getItem("user");

  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then((res) => res.json())
      .then((data) => {
        setBackendMessage(data.message);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
  if (!user) return;

  fetch(
    `http://localhost:5000/api/transactions/user/${user.id}`
  )
    .then((res) => res.json())
    .then((data) => {
      setTransactions(data);
    })
    .catch((err) => console.log(err));
}, [user]);

  const addTransaction = async () => {
    if (description === "" || amount === "") return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
         body: JSON.stringify({
  description,
  amount: Number(amount),
  date: new Date(),
  user: user.id,
}),
        }
      );

      const savedTransaction = await res.json();

      setTransactions([...transactions, savedTransaction]);

      setDescription("");
      setAmount("");
    } catch (error) {
      console.log(error);
    }
  };

  const loginUser = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    if (data.token) {
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setUser(data.user);

      alert("Login Successful");
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.log(err);
  }
};

const registerUser = async () => {
  try {
    const res = await fetch(
      "http://localhost:5000/api/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    alert(data.message);

    if (
      data.message ===
      "User registered successfully"
    ) {
      setIsLogin(true);
    }
  } catch (err) {
    console.log(err);
  }
};

const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  setUser(null);
};

  const deleteTransaction = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      setTransactions(
        transactions.filter((t) => t._id !== id)
      );
    } catch (err) {
      console.log(err);
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["Description", "Amount"],
      ...transactions.map((t) => [
        t.description,
        t.amount,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const balance = transactions.reduce(
    (total, item) => total + item.amount,
    0
  );

  const income = transactions
    .filter((item) => item.amount > 0)
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter((item) => item.amount < 0)
    .reduce((total, item) => total + item.amount, 0);

  const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

const monthlyTransactions = transactions.filter(
  (item) => {
    const date = new Date(item.date);

    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  }
);

const monthlyIncome = monthlyTransactions
  .filter((item) => item.amount > 0)
  .reduce((sum, item) => sum + item.amount, 0);

const monthlyExpense = monthlyTransactions
  .filter((item) => item.amount < 0)
  .reduce((sum, item) => sum + Math.abs(item.amount), 0);

const monthlySavings =
  monthlyIncome - monthlyExpense;
  
  const totalTransactions = transactions.length;

const highestIncome =
  Math.max(
    ...transactions
      .filter((t) => t.amount > 0)
      .map((t) => t.amount),
    0
  );

const highestExpense =
  Math.abs(
    Math.min(
      ...transactions
        .filter((t) => t.amount < 0)
        .map((t) => t.amount),
      0
    )
  );

  const lineChartData = {
  labels: transactions.map(
    (item) =>
      new Date(item.date).toLocaleDateString()
  ),

  datasets: [
    {
      label: "Transaction Amount",
      data: transactions.map(
        (item) => item.amount
      ),
      borderColor: "#2563eb",
      backgroundColor: "#2563eb",
      tension: 0.4,
    },
  ],
};

  const chartData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [income, Math.abs(expense)],
        backgroundColor: ["#22c55e", "#ef4444"],
      },
    ],
  };

if (!user) {
  return (
    <div className="container">
      <h1>💰 Expense Tracker</h1>

      <h2>
        {isLogin ? "Login" : "Register"}
      </h2>

      {!isLogin && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />

      <button
        onClick={
          isLogin
            ? loginUser
            : registerUser
        }
      >
        {isLogin ? "Login" : "Register"}
      </button>

      <p style={{ marginTop: "15px" }}>
        {isLogin
          ? "Don't have an account?"
          : "Already have an account?"}
      </p>

      <button
        onClick={() =>
          setIsLogin(!isLogin)
        }
      >
        {isLogin
          ? "Register Here"
          : "Login Here"}
      </button>
    </div>
  );
}

  return (
    <div
  className={`container ${
    darkMode ? "dark" : ""
  }`}
>
      <div className="header">
  <div>
    <h1>💰 Expense Tracker</h1>
    <p>Track your finances smarter</p>
  </div>

  <div>
    <p>👤 {user?.name}</p>

    <button
      onClick={logoutUser}
      className="logout-btn"
    >
      Logout
    </button>
  </div>
</div>

      <button
  onClick={() => setDarkMode(!darkMode)}
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

      <h2>Balance</h2>

<div className="balance">
  ₹{balance}
</div>

      <div className="summary">
        <div className="income-box">
          Income
          <br />
          ₹{income}
        </div>

        <div className="expense-box">
          Expense
          <br />
          ₹{Math.abs(expense)}
        </div>
      </div>

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) =>
          setAmount(e.target.value)
        }
      />

      <br />

      <button onClick={addTransaction}>
  {editingId
    ? "Update Transaction"
    : "Add Transaction"}
</button>

      <button
  className="clear-btn"
  onClick={async () => {
    if (window.confirm("Delete all transactions?")) {
      await fetch(
        "http://localhost:5000/api/transactions",
        {
          method: "DELETE",
        }
      );

      setTransactions([]);
    }
  }}
>
  Clear All
</button>

      <button onClick={exportCSV}>
        Export CSV
      </button>

      <div className="summary">
  <div className="income-box">
    This Month Income
    <br />
    ₹{monthlyIncome}
  </div>

  <div className="expense-box">
    This Month Expense
    <br />
    ₹{monthlyExpense}
  </div>

  <div className="savings-box">
  Savings
  <br />
  ₹{monthlySavings}
</div>
</div>

<div className="stats-container">
  <div className="stat-card">
    <h3>Total Transactions</h3>
    <p>{totalTransactions}</p>
  </div>

  <div className="stat-card">
    <h3>Highest Income</h3>
    <p>₹{highestIncome}</p>
  </div>

  <div className="stat-card">
    <h3>Highest Expense</h3>
    <p>₹{highestExpense}</p>
  </div>
</div>

<h2>Transaction Trend</h2>

<div className="chart-container">
  <Line
    data={lineChartData}
    options={{
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
    }}
  />
</div>

      <h2>Expense Overview</h2>

      <div className="chart-container">
   <Pie
  data={chartData}
  options={{
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },
  }}
/>
      </div>

      <input
  type="text"
  placeholder="🔍 Search transaction..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

<div style={{ marginBottom: "15px" }}>
  <button onClick={() => setFilter("all")}>
    All
  </button>

  <button onClick={() => setFilter("income")}>
    Income
  </button>

  <button onClick={() => setFilter("expense")}>
    Expense
  </button>
</div>

<h2>Recent Activity</h2>

<div className="activity-box">
  {transactions.slice(0, 3).map((item) => (
    <div
      key={item._id}
      className="activity-item"
    >
      <span>
        {item.amount > 0 ? "💰" : "💸"}
      </span>

      <span>
        {item.description}
      </span>

      <span>
        ₹{Math.abs(item.amount)}
      </span>
    </div>
  ))}
</div>

      <h2>Transactions</h2>

      {transactions
  .filter((item) =>
    item.description
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .filter((item) => {
    if (filter === "income") {
      return item.amount > 0;
    }

    if (filter === "expense") {
      return item.amount < 0;
    }

    return true;
  })
  .map((item) => (
        <div
          key={item._id}
          className="transaction"
          style={{
            borderLeft:
              item.amount > 0
                ? "5px solid #22c55e"
                : "5px solid #ef4444",
          }}
        >
          <div>
  <strong>
    {item.description} - ₹{item.amount}
  </strong>

  <br />

  <small>
    {item.date
      ? new Date(item.date).toLocaleString()
      : "No Date"}
  </small>
</div>

<button
  className="edit-btn"
  onClick={() => {
    setDescription(item.description);
    setAmount(item.amount);
    setEditingId(item._id);
  }}
>
  Edit
</button>

          <button
  className="delete-btn"
  onClick={() =>
    deleteTransaction(item._id)
  }
>
  Delete
</button>
        </div>
      ))}
    </div>
  );
}

export default App;