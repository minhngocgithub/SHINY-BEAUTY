import { computed, onMounted, watch } from "vue"
import { updateCanonicalUrl } from "../helpers/canonical-url"

export const useSeo = (props = {}) => {
    const {
        title = "SHINY BEAUTY",
        description = "Premium Cosmetics & Beauty Products",
        product = null,
        salePrograms = [],
        reviews = [],
        page = "default",
        canonicalUrl = "",
    } = props

    const currentUrl = computed(() => {
        if (typeof window !== "undefined") {
            return window.location.href
        }
        return ""
    })

    const seoTitle = computed(() => {
        if (page === "product" && product) {
            let titleText = `${product.name} - ${product.brand}`
            if (product.isOnSale || salePrograms.length > 0) {
                titleText += " | On Sale"
            }
            if (product.isNewProduct) {
                titleText += " | New Arrival"
            }
            return `${titleText} | SHINY BEAUTY - Premium Cosmetics`
        }
        return title
    })

    const seoDescription = computed(() => {
        if (page === "product" && product) {
            let desc = product.description?.slice(0, 155) || ""
            if (product.isOnSale && product.discountPercentage) {
                desc = `Save ${product.discountPercentage}%! ${desc}`
            }
            if (product.countInstock <= 5 && product.countInstock > 0) {
                desc += ` Limited stock available!`
            }
            return desc
        }
        return description
    })

    const seoKeywords = computed(() => {
        const keywords = ["beauty", "cosmetics", "makeup", "skincare"]

        if (page === "product" && product) {
            keywords.push(product.name)
            keywords.push(product.brand)

            if (product.category) {
                keywords.push(...product.category.map((cat) => cat.name))
            }

            if (product.isOnSale) {
                keywords.push("sale", "discount", "deal", "offer")
            }

            if (product.isBestSeller) {
                keywords.push("best seller", "popular")
            }
        }

        return keywords.join(", ")
    })

    const productImage = computed(() => {
        if (page === "product" && product) {
            if (Array.isArray(product.image)) {
                return product.image[0]?.url || product.image[0]
            }
            return product.image?.url || product.image || "/placeholder.png"
        }
        return "/logo.png"
    })

    const finalPrice = computed(() => {
        if (page === "product" && product) {
            if (product.salePrice) return product.salePrice
            if (product.isOnSale && product.discountPercentage) {
                return (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
            }
            return product.price
        }
        return 0
    })

    const productSchema = computed(() => {
        if (page !== "product" || !product) return null

        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: Array.isArray(product.image) ? product.image.map((img) => img.url || img) : [productImage.value],
            description: product.description,
            brand: {
                "@type": "Brand",
                name: product.brand,
            },
            sku: product._id,
            url: currentUrl.value,
            offers: {
                "@type": "Offer",
                url: currentUrl.value,
                priceCurrency: "USD",
                price: finalPrice.value,
                priceValidUntil: product.saleEndDate || undefined,
                availability: product.countInstock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                seller: {
                    "@type": "Organization",
                    name: "SHINY BEAUTY",
                    url: typeof window !== "undefined" ? window.location.origin : "",
                },
            },
        }

        if (reviews && reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            schema.aggregateRating = {
                "@type": "AggregateRating",
                ratingValue: avgRating.toFixed(1),
                reviewCount: reviews.length,
                bestRating: 5,
                worstRating: 1,
            }
        }

        return schema
    })

    const breadcrumbSchema = computed(() => {
        const items = [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: typeof window !== "undefined" ? window.location.origin : "",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: typeof window !== "undefined" ? `${window.location.origin}/products` : "",
            },
        ]

        if (page === "product" && product) {
            if (product.category && product.category[0]) {
                items.push({
                    "@type": "ListItem",
                    position: 3,
                    name: product.category[0].name,
                    item: typeof window !== "undefined" ? `${window.location.origin}/category/${product.category[0]._id}` : "",
                })
            }

            items.push({
                "@type": "ListItem",
                position: items.length + 1,
                name: product.name,
                item: currentUrl.value,
            })
        }

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: items,
        }
    })

    const organizationSchema = computed(() => {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SHINY BEAUTY",
            url: typeof window !== "undefined" ? window.location.origin : "",
            logo: typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "",
            description: "Premium beauty and cosmetics products",
            sameAs: [
                "https://www.facebook.com/shinybeauty",
                "https://www.instagram.com/shinybeauty",
                "https://www.twitter.com/shinybeauty",
            ],
        }
    })

    const updateCanonical = () => {
        if (canonicalUrl) {
            updateCanonicalUrl(canonicalUrl)
        } else if (typeof window !== "undefined") {
            updateCanonicalUrl(window.location.pathname)
        }
    }

    const updateMetaTags = () => {
        if (typeof document === "undefined") return

        document.title = seoTitle.value

        const metaTags = [
            { name: "description", content: seoDescription.value },
            { name: "keywords", content: seoKeywords.value },
            { property: "og:title", content: seoTitle.value },
            { property: "og:description", content: seoDescription.value },
            { property: "og:image", content: productImage.value },
            { property: "og:url", content: currentUrl.value },
            { property: "og:type", content: page === "product" ? "product" : "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:title", content: seoTitle.value },
            { name: "twitter:description", content: seoDescription.value },
            { name: "twitter:image", content: productImage.value },
            { name: "viewport", content: "width=device-width, initial-scale=1.0" },
            { name: "robots", content: "index, follow" },
            { name: "theme-color", content: "#000000" },
            { name: "apple-mobile-web-app-capable", content: "yes" },
        ]

        if (page === "product" && product) {
            metaTags.push(
                { property: "product:price:amount", content: finalPrice.value },
                { property: "product:price:currency", content: "USD" },
            )
        }

        metaTags.forEach((tag) => {
            const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`
            let element = document.querySelector(selector)

            if (!element) {
                element = document.createElement("meta")
                if (tag.name) element.setAttribute("name", tag.name)
                if (tag.property) element.setAttribute("property", tag.property)
                document.head.appendChild(element)
            }

            element.setAttribute("content", tag.content)
        })

        updateCanonical()
    }

    const updateSchemas = () => {
        if (typeof document === "undefined") return

        const existingScripts = document.querySelectorAll("script[data-schema]")
        existingScripts.forEach((script) => script.remove())

        const orgScript = document.createElement("script")
        orgScript.type = "application/ld+json"
        orgScript.setAttribute("data-schema", "organization")
        orgScript.textContent = JSON.stringify(organizationSchema.value)
        document.head.appendChild(orgScript)

        if (productSchema.value) {
            const productScript = document.createElement("script")
            productScript.type = "application/ld+json"
            productScript.setAttribute("data-schema", "product")
            productScript.textContent = JSON.stringify(productSchema.value)
            document.head.appendChild(productScript)
        }

        const breadcrumbScript = document.createElement("script")
        breadcrumbScript.type = "application/ld+json"
        breadcrumbScript.setAttribute("data-schema", "breadcrumb")
        breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema.value)
        document.head.appendChild(breadcrumbScript)
    }

    onMounted(() => {
        updateMetaTags()
        updateSchemas()
    })

    watch(
        () => product,
        () => {
            updateMetaTags()
            updateSchemas()
        },
        { deep: true },
    )

    watch(
        () => page,
        () => {
            updateMetaTags()
            updateSchemas()
        },
    )

    watch(
        () => canonicalUrl,
        () => {
            updateCanonical()
        },
    )

    return {
        seoTitle,
        seoDescription,
        seoKeywords,
        productImage,
        updateMetaTags,
        updateSchemas,
    }
}
