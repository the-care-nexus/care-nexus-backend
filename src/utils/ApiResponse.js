class ApiResponse {
  constructor(success, message, data = null, meta = null) {
    this.success = success;
    this.message = message;
    if (data !== null && data !== undefined) this.data = data;
    if (meta !== null && meta !== undefined) this.meta = meta;
  }
}

module.exports = ApiResponse;

