export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return 'Дата начала не может быть в прошлом';
  }

  if (end <= start) {
    return 'Дата окончания должна быть позже даты начала';
  }

  return null;
};
