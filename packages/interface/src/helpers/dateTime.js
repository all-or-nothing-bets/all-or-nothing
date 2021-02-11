const isValidDate = date => date instanceof Date && !Number.isNaN(date);

export const getUtcDateTime = localDateTime => {
  try {
    const date = new Date(localDateTime);
    if (isValidDate(date)) return date.toISOString();
    return '';
  } catch (error) {
    return error;
  }
};

export const parseUtcDateTime = utcDateTime => {
  try {
    const date = new Date(utcDateTime);
    if (isValidDate(date)) return Date.parse(utcDateTime);
    return '';
  } catch (error) {
    return error;
  }
};

export const parseLocalDateTime = localDateTime => {
  try {
    const date = new Date(localDateTime);
    if (isValidDate(date)) {
      const utcDateTime = getUtcDateTime(localDateTime);
      return parseUtcDateTime(utcDateTime);
    }
    return '';
  } catch (error) {
    return error;
  }
};

const formatToString = date => {
  try {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const dateTimeFormat = new Intl.DateTimeFormat('en', options);
    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: year },
      ,
      { value: hour },
      ,
      { value: minute },
    ] = dateTimeFormat.formatToParts(date);
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (error) {
    return error;
  }
};

export const getLocalDateTime = utcDateTime => {
  try {
    const date = new Date(utcDateTime);
    if (isValidDate(date)) return formatToString(date);
    return '';
  } catch (error) {
    return error;
  }
};

export const showLocalDateTime = utcDateTime => {
  try {
    if (utcDateTime) {
      const date = new Date(utcDateTime);
      if (isValidDate(date)) return date.toString().replace(/:\d{2}\sGMT.*/g, '');
    }
    return '';
  } catch (error) {
    return error;
  }
};

export const calculateTimeLeft = utcDateTime => {
  const now = new Date();
  const difference = utcDateTime - parseLocalDateTime(now);
  let timeLeft = {};
  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const convertTimestamp = timestamp => {
  try {
    const utcDateTime = new Date(timestamp * 1000);
    return utcDateTime;
  } catch (error) {
    console.log('Error converting timestamp to date');
  }
  return '';
};

const formatDateTime = utcDateTime => {
  try {
    if (utcDateTime) {
      const date = new Date(utcDateTime);
      if (isValidDate(date)) {
        let year = date.getFullYear();
        year = year.toString().substr(-2);
        const month = date.getMonth();
        const day = date.getDate();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours %= 12;
        hours = hours || 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        const formattedDateTime = `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
        return formattedDateTime;
      }
    }
  } catch (error) {
    console.log('Error formatting date');
  }
  return '';
};

export const showTimestampAsDateTime = timestamp => {
  const utcDateTime = convertTimestamp(timestamp);
  return formatDateTime(utcDateTime);
};
