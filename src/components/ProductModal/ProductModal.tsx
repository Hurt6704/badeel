import clsx from "clsx";
import { batch } from "solid-js";
import { toast } from "solid-toast";

import Button from "~components/Button/Button";
import Badge from "~components/Badge/Badge";
import Modal from "~components/Modal/Modal";

import t from "~utils/messages";
import { Product, Status } from "~types";
import { UNSURE_SOURCE_URL } from "~constants/documents";

import styles from "./ProductModal.module.scss";

import ShareIcon from "~assets/icons/share.svg?component-solid";
import CloseIcon from "~assets/icons/close.svg?component-solid";

const getCellURL = (ref: number) => `${UNSURE_SOURCE_URL}&range=A${ref}`;

const proofMapping = {
	Israeli: t("proof.content.israeli"),
	Emirati: t("proof.content.emirati"),
	Saudi: t("proof.content.saudi"),
	Supporter: t("proof.content.supporter"),
	Foreign: t("proof.content.foreign"),
};

const statusMapping: Record<Status, string> = {
	alternative: t("filters.alternative"),
	boycott: t("filters.boycott"),
	unsure: t("filters.unsure"),
};

type proofMappingKey = keyof typeof proofMapping;

interface ProofProps {
	product: Product;
}

const Proof = (props: ProofProps) => {
	return (
		<>
			{props.product.status === "boycott" ? (
				<div class={styles.proof}>
					<p class={clsx("t-button")}>{t("proof.title.boycott")}</p>
					<p class={clsx("t-body")}>
						{proofMapping[props.product.Proof as proofMappingKey] ??
							props.product.Proof}
					</p>
				</div>
			) : null}

			{props.product.status === "alternative" ? (
				<div class={styles.proof}>
					<p class={clsx("t-button")}>{t("proof.title.support")}</p>
					<p class={clsx("t-body")}>{t("proof.content.alternative")}</p>
				</div>
			) : null}

			{props.product.status === "unsure" ? (
				<div class={styles.proof}>
					<p class={clsx("t-button")}>{t("proof.title.context")}</p>
					<p class={clsx("t-body")}>{t("proof.content.unsure")}</p>
				</div>
			) : null}
		</>
	);
};

interface FooterActionsProps {
	product: Product;
	showAlternatives: () => void;
}

const FooterActions = (props: FooterActionsProps) => {
	return (
		<>
			{props.product.status === "boycott" ? (
				<Button variant="action" onClick={props.showAlternatives}>
					عرض البدائل
				</Button>
			) : null}

			{props.product.status === "boycott" && props.product.Link ? (
				<Button
					as="a"
					target="_blank"
					href={props.product.Link}
					variant="action-invert"
				>
					عرض الدليل
				</Button>
			) : null}

			{props.product.status === "alternative" && props.product.Contact ? (
				<Button
					as="a"
					target="_blank"
					href={props.product.Contact}
					variant="action"
				>
					{t("contact")}
				</Button>
			) : null}

			{props.product.status === "unsure" ? (
				<Button
					as="a"
					target="_blank"
					href={getCellURL(props.product.ref)}
					variant="action"
				>
					{t("source")}
				</Button>
			) : null}
		</>
	);
};

interface ProductModalProps {
	product: Product;
	close: () => void;
	showAlternatives: (product: Product) => void;
}

export default function ProductModal(props: ProductModalProps) {
	const showAlternatives = () => {
		batch(() => {
			props.showAlternatives(props.product);
			props.close();
		});
	};

	const handleShareProduct = async (productId: string) => {
		try {
			const url = new URL(location.href);
			const toastOptions = {
				icon: "🥳",
			};

			url.searchParams.append("productId", productId);

			if (navigator.share) {
				await navigator.share({
					text: `تصفح ${props.product.Name} على بَدِيل`,
					url: url.toString(),
				});

				toast(t("productModal.shared"), toastOptions);
			} else if (navigator.clipboard) {
				await navigator.clipboard.writeText(url.toString());

				toast(t("productModal.copied"), toastOptions);
			}
		} catch (error) {
			if (error instanceof Error && error.name !== "AbortError") {
				toast.error(t("productModal.shareError"));
			}
		}
	};

	const product = () => props.product;

	return (
		<Modal close={props.close} id="product-modal">
			<div class={styles.body}>
				<div class={styles.header}>
					<div>
						<p class={clsx("t-button", styles.name)}>{product().Name}</p>
						<p class={clsx("t-body", styles.englishName)}>
							{product()["English Name"]}
						</p>
					</div>

					<Button
						id="close"
						aria-label="close dialog"
						variant="action-invert"
						onClick={props.close}
						class={styles.close}
					>
						<CloseIcon role="presentation" />
					</Button>
				</div>

				<div class={styles.content}>
					<div class={styles.meta}>
						<Badge variant={product().status}>
							{statusMapping[product().status]}
						</Badge>
					</div>

					<div class={styles.proof}>
						<p class={clsx("t-button")}>{t("manufacturer")}</p>
						<p class={clsx("t-body")}>
							{product().Manufacturer.length > 0
								? product().Manufacturer
								: "غير متوفر"}
						</p>
					</div>

					<Proof product={product()} />

					<div class={styles.footer}>
						<FooterActions
							product={product()}
							showAlternatives={showAlternatives}
						/>

						<Button
							onClick={[handleShareProduct, props.product.id]}
							class={styles.share}
							variant="action-invert"
						>
							{t("productModal.share")}
							<ShareIcon role="presentation" />
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
