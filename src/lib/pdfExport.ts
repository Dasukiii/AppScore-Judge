import jsPDF from 'jspdf';

interface AppData {
    id: string;
    name: string;
    owner: string;
    url: string;
    description?: string | null;
    total_score: number;
    ux_score: number;
    usefulness_score: number;
    reliability_score: number;
    data_handling_score: number;
    clarity_score: number;
    ux_explanation?: string | null;
    usefulness_explanation?: string | null;
    reliability_explanation?: string | null;
    data_handling_explanation?: string | null;
    clarity_explanation?: string | null;
    ai_feedback?: string | null;
    ai_strengths?: string[] | null;
    ai_improvements?: string[] | null;
    evaluated_at?: string | null;
    created_at: string;
}

export function exportAppToPDF(app: AppData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AppScore Judge', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('AI-Powered Application Evaluation Report', pageWidth / 2, 30, { align: 'center' });

    y = 50;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(20);
    doc.text(app.name, margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`by ${app.owner}`, margin, y);
    y += 15;

    doc.setFillColor(79, 70, 229);
    doc.roundedRect(margin, y, 50, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(`${app.total_score}%`, margin + 25, y + 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Overall Score', margin + 25, y + 23, { align: 'center' });

    y += 35;

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`URL: ${app.url}`, margin, y);
    y += 7;

    const evaluatedDate = new Date(app.evaluated_at || app.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    doc.text(`Evaluated: ${evaluatedDate}`, margin, y);
    y += 15;

    if (app.description) {
        doc.setFontSize(12);
        doc.setTextColor(79, 70, 229);
        doc.text('DESCRIPTION', margin, y);
        y += 7;

        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        const descLines = doc.splitTextToSize(app.description, pageWidth - 2 * margin);
        doc.text(descLines, margin, y);
        y += descLines.length * 5 + 10;
    }

    if (y > 240) {
        doc.addPage();
        y = margin;
    }

    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('SCORE BREAKDOWN', margin, y);
    y += 10;

    const scores = [
        { label: 'User Experience', score: app.ux_score },
        { label: 'Usefulness', score: app.usefulness_score },
        { label: 'Reliability', score: app.reliability_score },
        { label: 'Data Handling', score: app.data_handling_score },
        { label: 'Clarity', score: app.clarity_score },
    ];

    scores.forEach((item) => {
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(item.label, margin, y);

        const barWidth = 100;
        const barHeight = 8;
        const filledWidth = (item.score / 5) * barWidth;

        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin + 60, y - 5, barWidth, barHeight, 2, 2, 'F');

        doc.setFillColor(79, 70, 229);
        doc.roundedRect(margin + 60, y - 5, filledWidth, barHeight, 2, 2, 'F');

        doc.setTextColor(79, 70, 229);
        doc.setFontSize(11);
        doc.text(`${item.score}/5`, margin + 165, y);

        y += 12;
    });

    y += 5;

    if (y > 240) {
        doc.addPage();
        y = margin;
    }

    const explanations = [
        { label: 'User Experience', text: app.ux_explanation },
        { label: 'Usefulness', text: app.usefulness_explanation },
        { label: 'Reliability', text: app.reliability_explanation },
        { label: 'Data Handling', text: app.data_handling_explanation },
        { label: 'Clarity', text: app.clarity_explanation },
    ];

    const hasExplanations = explanations.some(e => e.text);

    if (hasExplanations) {
        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('DETAILED EXPLANATIONS', margin, y);
        y += 10;

        explanations.forEach((item) => {
            if (item.text) {
                if (y > 250) {
                    doc.addPage();
                    y = margin;
                }

                doc.setFontSize(11);
                doc.setTextColor(30, 41, 59);
                doc.text(`${item.label}:`, margin, y);
                y += 6;

                doc.setFontSize(9);
                doc.setTextColor(71, 85, 105);
                const lines = doc.splitTextToSize(item.text, pageWidth - 2 * margin);
                doc.text(lines, margin, y);
                y += lines.length * 4 + 8;
            }
        });
    }

    if (app.ai_feedback) {
        if (y > 220) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(79, 70, 229);
        doc.text('AI-GENERATED FEEDBACK', margin, y);
        y += 10;

        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        const feedbackLines = doc.splitTextToSize(app.ai_feedback, pageWidth - 2 * margin);
        doc.text(feedbackLines, margin, y);
        y += feedbackLines.length * 4 + 10;
    }

    if (app.ai_strengths && app.ai_strengths.length > 0) {
        if (y > 220) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(12);
        doc.setTextColor(22, 163, 74);
        doc.text('STRENGTHS', margin, y);
        y += 8;

        app.ai_strengths.forEach((strength) => {
            if (y > 270) {
                doc.addPage();
                y = margin;
            }

            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text('•', margin + 2, y);
            const strengthLines = doc.splitTextToSize(strength, pageWidth - 2 * margin - 8);
            doc.text(strengthLines, margin + 8, y);
            y += strengthLines.length * 4 + 3;
        });

        y += 5;
    }

    if (app.ai_improvements && app.ai_improvements.length > 0) {
        if (y > 220) {
            doc.addPage();
            y = margin;
        }

        doc.setFontSize(12);
        doc.setTextColor(234, 88, 12);
        doc.text('AREAS FOR IMPROVEMENT', margin, y);
        y += 8;

        app.ai_improvements.forEach((improvement) => {
            if (y > 270) {
                doc.addPage();
                y = margin;
            }

            doc.setFontSize(9);
            doc.setTextColor(30, 41, 59);
            doc.text('•', margin + 2, y);
            const improvementLines = doc.splitTextToSize(improvement, pageWidth - 2 * margin - 8);
            doc.text(improvementLines, margin + 8, y);
            y += improvementLines.length * 4 + 3;
        });
    }

    const totalPages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
            `© 2026 AppScore Judge • Page ${i} of ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`${app.name.replace(/[^a-z0-9]/gi, '_')}_evaluation.pdf`);
}

export function exportMultipleAppsToPDF(apps: AppData[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('AppScore Judge', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text('Application Evaluation Summary Report', pageWidth / 2, 30, { align: 'center' });

    let y = 55;

    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text(`EVALUATION SUMMARY (${apps.length} Apps)`, margin, y);
    y += 10;

    apps.forEach((app, index) => {
        if (y > 250) {
            doc.addPage();
            y = margin;
        }

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y - 5, pageWidth - 2 * margin, 35, 3, 3, 'F');

        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(`${index + 1}. ${app.name}`, margin + 5, y + 5);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`by ${app.owner}`, margin + 5, y + 12);

        doc.setFillColor(79, 70, 229);
        doc.circle(pageWidth - margin - 15, y + 10, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(`${app.total_score}`, pageWidth - margin - 15, y + 12, { align: 'center' });

        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const scoreBreakdown = `UX: ${app.ux_score} | Useful: ${app.usefulness_score} | Reliable: ${app.reliability_score} | Data: ${app.data_handling_score} | Clarity: ${app.clarity_score}`;
        doc.text(scoreBreakdown, margin + 5, y + 22);

        y += 45;
    });

    const totalPages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
            `© 2026 AppScore Judge • Page ${i} of ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    const date = new Date().toISOString().split('T')[0];
    doc.save(`AppScore_Summary_${date}.pdf`);
}
