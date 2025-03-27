const { validateMandate } = require('../../validators/mandateValidator');
const { ApiError } = require('../../utils/errors');

describe('Mandate Validator', () => {
  const validMandate = {
    role: 'PRESIDENT',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
  };

  it('should validate a correct mandate', async () => {
    const result = await validateMandate(validMandate);
    expect(result).toEqual(validMandate);
  });

  it('should require role', async () => {
    const { role, ...mandateWithoutRole } = validMandate;
    await expect(validateMandate(mandateWithoutRole)).rejects.toThrow(ApiError);
  });

  it('should validate role enum', async () => {
    const invalidMandate = {
      ...validMandate,
      role: 'INVALID_ROLE',
    };
    await expect(validateMandate(invalidMandate)).rejects.toThrow(ApiError);
  });

  it('should require startDate', async () => {
    const { startDate, ...mandateWithoutStart } = validMandate;
    await expect(validateMandate(mandateWithoutStart)).rejects.toThrow(ApiError);
  });

  it('should require endDate', async () => {
    const { endDate, ...mandateWithoutEnd } = validMandate;
    await expect(validateMandate(mandateWithoutEnd)).rejects.toThrow(ApiError);
  });

  it('should validate date order', async () => {
    const invalidDates = {
      ...validMandate,
      startDate: '2024-12-31',
      endDate: '2024-01-01',
    };
    await expect(validateMandate(invalidDates)).rejects.toThrow(ApiError);
  });

  it('should accept valid dates', async () => {
    const validDates = {
      ...validMandate,
      startDate: '2024-01-01',
      endDate: '2025-12-31',
    };
    const result = await validateMandate(validDates);
    expect(result).toEqual(validDates);
  });

  it('should handle invalid date formats', async () => {
    const invalidFormat = {
      ...validMandate,
      startDate: 'invalid-date',
    };
    await expect(validateMandate(invalidFormat)).rejects.toThrow(ApiError);
  });

  it('should accept boolean isActive', async () => {
    const withIsActive = {
      ...validMandate,
      isActive: false,
    };
    const result = await validateMandate(withIsActive);
    expect(result.isActive).toBe(false);
  });

  it('should handle non-boolean isActive', async () => {
    const invalidIsActive = {
      ...validMandate,
      isActive: 'true',
    };
    await expect(validateMandate(invalidIsActive)).rejects.toThrow(ApiError);
  });
});
