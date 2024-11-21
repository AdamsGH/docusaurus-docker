import Details from '@theme/MDXComponents/Details';

export default function Collapse (props: { children: React.ReactNode; title?: string }) {
    const { children, title = "Collapse" } = props;

    return (
        <Details className="collapse">
            <summary mdxType="summary">{title}</summary>

            {children}
        </Details>
    );
}