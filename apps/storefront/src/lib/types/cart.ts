export interface CartItem {
  id?: string
  variant_id: string
  product_id: string
  product_handle?: string
  quantity: number
  title: string
  sku?: string
  price: number
  image?: string
  variant_title?: string
}

export interface Cart {
  cart_id: string
  customer_id?: string
  region_id?: string
  items: CartItem[]
  total: number
  last_updated: number
  is_guest: boolean
  medusa_cart_id?: string
}
