/* eslint-disable no-unused-vars */
/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Placeholder,
	Button,
	PanelBody,
} from '@wordpress/components';
import {
	useBlockProps,
	MediaUpload,
	BlockControls,
	AlignmentToolbar,
	InspectorControls,
	__experimentalImageSizeControl as ImageSizeControl,
	MediaReplaceFlow
} from '@wordpress/block-editor';
import PropTypes from 'prop-types';

/**
 * Edit component.
 * See https://wordpress.org/gutenberg/handbook/designers-developers/developers/block-api/block-edit-save/#edit
 *
 * @param {Object}   props                      The block props.
 * @param {Object}   props.attributes           Block attributes.
 * @param {Object}   props.attributes.svgURL    SVG URL.
 * @param {boolean}  props.attributes.alignment Alignment of the SVG.
 * @param {string}   props.className            Class name for the block.
 * @param {Function} props.setAttributes        Sets the value for block attributes.
 * @return {Function} Render the edit screen
 */
const SafeSvgBlockEdit = ( props ) => {
	const { attributes, setAttributes } = props;
	const {
		contentPostType,
		svgURL,
		type,
		imageID,
		imageSizes,
		alignment,
		imageWidth,
		imageHeight,
		dimensionWidth,
		dimensionHeight
	} = attributes;
	const blockProps = useBlockProps();

	const ALLOWED_MEDIA_TYPES = [ 'image/svg+xml' ];

	const onSelectImage = media => {
		if ( !media.sizes && !media.media_details?.sizes ) {
			return;
		}

		if( media.media_details ) {
			media.sizes = media.media_details.sizes;
		}

		const newURL = media.sizes.full.url ?? media.sizes.full.source_url;

		setAttributes( {
			imageSizes: {
				full: media.sizes.full,
				medium: media.sizes.medium,
				thumbnail: media.sizes.thumbnail,
			},
			svgURL: newURL,
			type: 'full',
		} );
	};

	const onError = ( message ) => {
		console.log( __(`Something went wrong, please try again. Message: ${message}`, 'safe-svg') );
	}

	const onChange = (dimensionSizes) => {
		if( !dimensionSizes.width && !dimensionSizes.height ) {
			dimensionSizes.width = imageSizes[type].width;
			dimensionSizes.height = imageSizes[type].height;
		}
		setAttributes({
			dimensionWidth: dimensionSizes.width ?? dimensionWidth,
			dimensionHeight: dimensionSizes.height ?? dimensionHeight
		})
	}

	const onChangeImage = (newSizeSlug) => {
		const newUrl = imageSizes[newSizeSlug].url ?? imageSizes[newSizeSlug].source_url;
		if( ! newUrl ) {
			return null;
		}
		setAttributes({
			svgURL: newUrl,
			imageWidth: parseInt( imageSizes[newSizeSlug].width ),
			imageHeight: parseInt( imageSizes[newSizeSlug].height ),
			dimensionWidth: parseInt( imageSizes[newSizeSlug].width ),
			dimensionHeight: parseInt( imageSizes[newSizeSlug].height ),
			type: newSizeSlug
		})
	}

	const imageSizeOptions = [
		{ value: 'full', label: 'Full Size' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'thumbnail', label: 'Thumbnail' },
	];

	return (
		<div { ...blockProps } style={{overflow: 'hidden'}}>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Image settings',
						'safe-svg'
					) }
				>
					<ImageSizeControl
						width={ dimensionWidth }
						height={ dimensionHeight }
						imageWidth={ imageWidth }
						imageHeight={ imageHeight }
						imageSizeOptions={imageSizeOptions}
						slug={type}
						onChange={ onChange }
						onChangeImage={ onChangeImage }
					/>
				</PanelBody>
			</InspectorControls>
			<BlockControls>
				<AlignmentToolbar
					value={alignment}
					onChange={(newVal) => setAttributes({alignment: newVal})}
				/>
			</BlockControls>
			<BlockControls>
				<MediaReplaceFlow
					mediaId={ imageID }
					mediaURL={ svgURL }
					allowedTypes={ALLOWED_MEDIA_TYPES}
					accept={ALLOWED_MEDIA_TYPES}
					onSelect={ onSelectImage }
					onError={ onError }
				/>
			</BlockControls>
			<MediaUpload
				onSelect={onSelectImage}
				allowedTypes={ALLOWED_MEDIA_TYPES}
				accept={ALLOWED_MEDIA_TYPES}
				value={imageID}
				render={({open}) => {
					return (
						<div
							style={{
								maxWidth: '100%',
								textAlign: alignment
							}}
						>
							{!svgURL &&
								<Button variant="tertiary" onClick={open}>
									{__('Media Library', 'safe-svg')}
								</Button>
							}
							{svgURL &&
								<svg
									style={{
										width: dimensionWidth,
										height: dimensionHeight,
									}}
								>
									<image
										xlinkHref={svgURL}
										src={svgURL}
										width="100%"
									/>
								</svg>
							}
						</div>
					);
				}}
			/>
			{ contentPostType && (
				<Placeholder
					label={ __( 'SafeSvg', 'safe-svg' ) }
				>
					<p>
						{ __(
							'Please select the SVG icon.',
							'safe-svg'
						) }
					</p>
				</Placeholder>
			) }
		</div>
	);
};
// Set the propTypes
SafeSvgBlockEdit.propTypes = {
	attributes: PropTypes.shape({
		svgURL: PropTypes.string,
		alignment: PropTypes.string,
		imageID: PropTypes.number,
		imageWidth: PropTypes.number,
		imageHeight: PropTypes.number,
		dimensionWidth: PropTypes.number,
		dimensionHeight: PropTypes.number,
		imageSizes: PropTypes.object,
	}).isRequired,
	className: PropTypes.string,
	clientId: PropTypes.string,
	setAttributes: PropTypes.func.isRequired,
};

export default SafeSvgBlockEdit;
