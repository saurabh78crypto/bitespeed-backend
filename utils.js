function formDate(date) {
    return new Date(date).toISOString().slice(0,16);
}

export default formDate;