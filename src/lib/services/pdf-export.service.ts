/**
 * Service for PDF export functionality
 */

import { MoneyGoalExportData } from "@/types/money-goals";

export const PDFExportService = {
  /**
   * Export money goals data to PDF
   *
   * @async
   * @param {MoneyGoalExportData} data - Data to export
   * @param {string} filename - Filename for the PDF
   * @returns {Promise<void>} Promise that resolves when export is complete
   */
  exportMoneyGoalsToPDF: async (data: MoneyGoalExportData): Promise<void> => {
    // Create HTML content for PDF
    const htmlContent = generateMoneyGoalsHTML(data);

    // Create a temporary iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Write HTML content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Trigger print dialog
      setTimeout(() => {
        iframe.contentWindow?.print();

        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  },
};

/**
 * Generate HTML content for money goals PDF export
 */
function generateMoneyGoalsHTML(data: MoneyGoalExportData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport des Objectifs Financiers</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }
        .header h1 {
          color: #2563eb;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          color: #666;
          margin: 5px 0;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          color: #475569;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
          margin: 0;
        }
        .filters {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
        }
        .filters h3 {
          margin: 0 0 10px 0;
          color: #475569;
        }
        .filters p {
          margin: 5px 0;
          color: #64748b;
        }
        .table-container {
          margin-bottom: 30px;
        }
        .table-container h3 {
          margin-bottom: 15px;
          color: #1e293b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #e2e8f0;
          padding: 12px;
          text-align: left;
        }
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #475569;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-active {
          background: #dcfce7;
          color: #166534;
        }
        .status-completed {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #2563eb;
          transition: width 0.3s ease;
        }
        .totals {
          background: #f1f5f9;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
        }
        .totals h3 {
          margin: 0 0 15px 0;
          color: #1e293b;
        }
        .totals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .total-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .total-item:last-child {
          border-bottom: none;
        }
        .total-label {
          font-weight: 500;
          color: #475569;
        }
        .total-value {
          font-weight: 600;
          color: #1e293b;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 0;
          }
          .header {
            break-inside: avoid;
          }
          .summary {
            break-inside: avoid;
          }
          .table-container {
            break-inside: avoid;
          }
          .totals {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport des Objectifs Financiers</h1>
        <p>Généré le ${formatDate(data.exportDate)}</p>
        ${data.filters.years ? `<p>Année: ${data.filters.years}</p>` : ""}
        ${data.filters.status ? `<p>Statut: ${getStatusText(data.filters.status)}</p>` : ""}
      </div>

      <div class="summary">
        <div class="summary-card">
          <h3>Total des Objectifs</h3>
          <p class="value">${data.summary.totalGoals}</p>
        </div>
        <div class="summary-card">
          <h3>Objectifs Actifs</h3>
          <p class="value">${data.summary.activeGoals}</p>
        </div>
        <div class="summary-card">
          <h3>Objectifs Terminés</h3>
          <p class="value">${data.summary.completedGoals}</p>
        </div>
        <div class="summary-card">
          <h3>Progrès Global</h3>
          <p class="value">${data.summary.overallProgress.toFixed(1)}%</p>
        </div>
      </div>

      <div class="filters">
        <h3>Filtres Appliqués</h3>
        <p><strong>Année:</strong> ${data.filters.years || "Toutes"}</p>
        <p><strong>Statut:</strong> ${data.filters.status ? getStatusText(data.filters.status) : "Tous"}</p>
        <p><strong>Catégorie:</strong> ${data.filters.categoryId ? "Filtrée" : "Toutes"}</p>
        <p><strong>Recherche:</strong> ${data.filters.search || "Aucune"}</p>
      </div>

      <div class="table-container">
        <h3>Liste des Objectifs</h3>
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Montant Cible</th>
              <th>Montant Atteint</th>
              <th>Progrès</th>
              <th>Statut</th>
              <th>Année</th>
              <th>Créateur</th>
            </tr>
          </thead>
          <tbody>
            ${data.goals
              .map(
                (goal) => `
              <tr>
                <td>${goal.name}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    ${goal.category?.color ? `<div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${goal.category.color}; border: 1px solid #e2e8f0;"></div>` : ""}
                    <span>${goal.category?.nameFr || goal.category?.name || "N/A"}</span>
                  </div>
                </td>
                <td>${formatCurrency(goal.amountGoal)}</td>
                <td>${formatCurrency(goal.reachedGoal)}</td>
                <td>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progressPercentage}%"></div>
                  </div>
                  ${goal.progressPercentage.toFixed(1)}%
                </td>
                <td>
                  <span class="status-badge status-${goal.status}">
                    ${getStatusText(goal.status)}
                  </span>
                </td>
                <td>${goal.years}</td>
                <td>${goal.creator.name || goal.creator.email}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <h3>Totaux</h3>
        <div class="totals-grid">
          <div class="total-item">
            <span class="total-label">Total Montant Cible:</span>
            <span class="total-value">${formatCurrency(data.summary.totalTargetAmount)}</span>
          </div>
          <div class="total-item">
            <span class="total-label">Total Montant Atteint:</span>
            <span class="total-value">${formatCurrency(data.summary.totalReachedAmount)}</span>
          </div>
          <div class="total-item">
            <span class="total-label">Montant Restant:</span>
            <span class="total-value">${formatCurrency(data.summary.totalTargetAmount - data.summary.totalReachedAmount)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Rapport généré par le système de gestion CK • ${formatDate(data.exportDate)}</p>
      </div>
    </body>
    </html>
  `;
}
