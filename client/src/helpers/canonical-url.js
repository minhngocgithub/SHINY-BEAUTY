export const setCanonicalUrl = (url) => {
    if (typeof document === "undefined") return

    let canonicalLink = document.querySelector('link[rel="canonical"]')

    if (!canonicalLink) {
        canonicalLink = document.createElement("link")
        canonicalLink.rel = "canonical"
        document.head.appendChild(canonicalLink)
    }

    canonicalLink.href = url
}

export const getCanonicalUrl = (route, baseUrl = "") => {
    if (!baseUrl && typeof window !== "undefined") {
        baseUrl = window.location.origin
    }
    const cleanPath = route.split("?")[0].split("#")[0]

    return `${baseUrl}${cleanPath}`
}

export const updateCanonicalUrl = (route, baseUrl = "") => {
    const canonicalUrl = getCanonicalUrl(route, baseUrl)
    setCanonicalUrl(canonicalUrl)
}

export const setAlternateLinks = (alternates = []) => {
    if (typeof document === "undefined") return

    // Remove existing alternate links
    document.querySelectorAll('link[rel="alternate"]').forEach((link) => {
        link.remove()
    })
    alternates.forEach((alternate) => {
        const link = document.createElement("link")
        link.rel = "alternate"
        if (alternate.hreflang) link.hreflang = alternate.hreflang
        link.href = alternate.href
        document.head.appendChild(link)
    })
}

export const setLanguageAlternates = (currentLang = "en", baseUrl = "") => {
    if (!baseUrl && typeof window !== "undefined") {
        baseUrl = window.location.origin
    }

    const languages = ["en", "es", "fr", "de", "it", "pt", "ja", "zh"]
    const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

    const alternates = languages.map((lang) => ({
        hreflang: lang,
        href: `${baseUrl}${currentPath}?lang=${lang}`,
    }))
    alternates.push({
        hreflang: "x-default",
        href: `${baseUrl}${currentPath}`,
    })

    setAlternateLinks(alternates)
}
