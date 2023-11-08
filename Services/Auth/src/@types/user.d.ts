export interface User{
    email : string
    name : string
    password: string,
    confirm_password: string,
    recaptcha_token: string,
    provider: string,
    google_id: string,
    access_token: string,
    refresh_token: string,
    token_epiresIn: string,
    user_id: number,
    lastName: string,
    userId: string,
    image: string,
    user: string,
    currentPassword: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvc: number,
    email: string,
    promoCode: string,
    userId: string,
    is_admin: boolean
}

export interface SettingsInterface {
    firstName: string,
    lastName: string,
    password: string,
    currentPassword: string,
    confirmPassword: string,
    image: string,
    email: string,
    user: string
}

export interface PaymentInterface {
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvc: number,
    email: string,
    promoCode: string,
    userId: string,
}