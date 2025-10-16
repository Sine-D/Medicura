import EmployeePayment from '../models/EmployeePayment.js';

// Create new employee payment
export const createPayment = async (req, res) => {
  try {
    const { employeeId, employeeName, role, baseSalary, attendanceDays, paymentDate, status } = req.body;

    let totalSalary = baseSalary;
    if (attendanceDays >= 20) totalSalary += 7500;

    const payment = new EmployeePayment({
      employeeId,
      employeeName,
      role,
      baseSalary,
      attendanceDays,
      totalSalary,
      paymentDate,
      status,
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: "Error creating employee payment", error: error.message });
  }
};

// Get all payments
export const getPayments = async (req, res) => {
  try {
    const payments = await EmployeePayment.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee payments", error: error.message });
  }
};

// Get payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const payment = await EmployeePayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Employee payment not found" });
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee payment", error: error.message });
  }
};

// Update payment
export const updatePayment = async (req, res) => {
  try {
    const { baseSalary, attendanceDays } = req.body;

    let updatedData = { ...req.body };

    if (baseSalary && attendanceDays) {
      let totalSalary = baseSalary;
      if (attendanceDays >= 20) totalSalary += 7500;
      updatedData.totalSalary = totalSalary;
    }

    const updatedPayment = await EmployeePayment.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedPayment) return res.status(404).json({ message: "Employee payment not found" });
    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: "Error updating employee payment", error: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const deletedPayment = await EmployeePayment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) return res.status(404).json({ message: "Employee payment not found" });
    res.status(200).json({ message: "Employee payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee payment", error: error.message });
  }
};

export default {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};
