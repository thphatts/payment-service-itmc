package com.itmc.payment_service.dto;

public class CreatePaymentLinkRequestBody {
    private String productName;
    private String description;
    private String returnUrl;
    private String cancelUrl;
    private int price;

    public CreatePaymentLinkRequestBody() {
    }

    public CreatePaymentLinkRequestBody(String productName, String description, String returnUrl, String cancelUrl, int price) {
        this.productName = productName;
        this.description = description;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
        this.price = price;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }
}
