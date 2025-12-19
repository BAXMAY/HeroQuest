'use client';

// Eyes Component
export const Eyes = ({ style }: { style: 'normal' | 'happy' | 'wink' }) => {
    switch (style) {
        case 'happy':
            return (
                <g>
                    <path d="M 35 48 Q 40 52 45 48" stroke="black" fill="none" strokeWidth="1.5" />
                    <path d="M 55 48 Q 60 52 65 48" stroke="black" fill="none" strokeWidth="1.5" />
                </g>
            );
        case 'wink':
            return (
                <g>
                    <circle cx="38" cy="48" r="1.5" fill="black" />
                    <path d="M 55 48 Q 60 45 65 48" stroke="black" fill="none" strokeWidth="1.5" />
                </g>
            );
        case 'normal':
        default:
            return (
                <g>
                    <circle cx="38" cy="48" r="1.5" fill="black" />
                    <circle cx="62" cy="48" r="1.5" fill="black" />
                </g>
            );
    }
};

// Hair Component
export const Hair = ({ style, color }: { style: 'short' | 'long' | 'bald', color: string }) => {
    switch (style) {
        case 'short':
            return (
                <path
                    d="M 30 15 Q 50 5, 70 15 T 75 30 L 70 35 L 30 35 L 25 30 Z"
                    fill={color}
                />
            );
        case 'long':
            return (
                <path
                    d="M 20 25 Q 50 10, 80 25 T 85 50 L 75 90 L 25 90 L 15 50 Z"
                    fill={color}
                />
            );
        case 'bald':
        default:
            return null;
    }
};

// Shirt Component
export const Shirt = ({ style, color }: { style: 'crew' | 'polo', color: string }) => {
    switch (style) {
        case 'polo':
            return (
                <g>
                    <path d="M 20 85 C 20 70, 80 70, 80 85 L 80 100 L 20 100 Z" fill={color} />
                    {/* Collar */}
                    <path d="M 40 80 L 50 70 L 60 80 Z" fill={color} stroke="#000" strokeWidth="0.5" />
                </g>
            );
        case 'crew':
        default:
             return <path d="M 20 85 C 20 75, 80 75, 80 85 L 80 100 L 20 100 Z" fill={color} />
    }
};

// Accessories Component
export const Accessories = ({ style }: { style: 'none' | 'glasses' }) => {
    switch (style) {
        case 'glasses':
            return (
                <g stroke="black" strokeWidth="1.5" fill="none">
                    <circle cx="38" cy="48" r="6" />
                    <circle cx="62" cy="48" r="6" />
                    <path d="M 44 48 H 56" />
                </g>
            );
        case 'none':
        default:
            return null;
    }
};
